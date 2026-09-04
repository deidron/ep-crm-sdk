import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');

const routesPath = path.join(root, 'src/app/config/service-routes.json');

const banner = 'generated from src/app/config/service-routes.json by "pnpm routes:sync"';

function scoped(routes, scope) {
  return routes.filter(([, route]) => route.scope === scope);
}

function nginxMap(routes) {
  return routes.map(([alias, route]) => {
    const prefix = route.scope === 'workspace' ? '${CRM_WORKSPACE}' : '';
    return `if ($crm_key = "${alias}") { set $mapped_url "${prefix}/${route.path}"; }`;
  });
}

function iisMap(routes, scope) {
  return scoped(routes, scope).map(
    ([alias, route]) => `<add key="${alias}" value="/${route.path}" />`,
  );
}

const targets = [
  {
    file: path.join(root, 'server/nginx.conf'),
    blocks: [
      {
        open: [`# >>> ${banner} — do not edit by hand`],
        close: '# <<< end of the generated block',
        build: nginxMap,
      },
    ],
  },
  {
    file: path.join(root, 'server/web.config'),
    blocks: [
      {
        open: [`<!-- >>> workspace services, ${banner} — do not edit by hand -->`],
        close: '<!-- <<< end of the generated block -->',
        build: (routes) => iisMap(routes, 'workspace'),
      },
      {
        open: [`<!-- >>> application services, ${banner} — do not edit by hand -->`],
        close: '<!-- <<< end of the generated block -->',
        build: (routes) => iisMap(routes, 'application'),
      },
    ],
  },
];

function renderBlock(content, block, target, routes) {
  const openAt = content.indexOf(block.open[0]);
  if (openAt === -1) {
    throw new Error(`No block "${block.open[0]}" found in ${target.file}. Restore its markers.`);
  }
  const closeAt = content.indexOf(block.close, openAt);
  if (closeAt === -1) {
    throw new Error(`No closing marker after "${block.open[0]}" in ${target.file}.`);
  }
  const start = content.lastIndexOf('\n', openAt) + 1;
  const indent = content.slice(start, openAt);
  const lines = [...block.open, ...block.build(routes), block.close];
  return (
    content.slice(0, start) +
    indent +
    lines.join(`\n${indent}`) +
    content.slice(closeAt + block.close.length)
  );
}

function render(target, routes) {
  const content = readFileSync(target.file, 'utf8');
  const updated = target.blocks.reduce(
    (text, block) => renderBlock(text, block, target, routes),
    content,
  );
  return { content, updated };
}

const write = process.argv.includes('--write');
const routes = Object.entries(JSON.parse(readFileSync(routesPath, 'utf8')));
let drifted = 0;

for (const target of targets) {
  const { content, updated } = render(target, routes);
  if (content === updated) {
    continue;
  }
  drifted += 1;
  const name = path.relative(root, target.file).split(path.sep).join('/');
  if (write) {
    writeFileSync(target.file, updated);
    console.log(`[routes] updated ${name}`);
  } else {
    console.error(
      `[routes] ${name} is out of step with service-routes.json. Run "pnpm routes:sync".`,
    );
  }
}

if (!write && drifted > 0) {
  process.exit(1);
}

console.log(
  write
    ? `[routes] ${routes.length} services, ${drifted} file(s) rewritten.`
    : `[routes] ${routes.length} services, server maps in step.`,
);
