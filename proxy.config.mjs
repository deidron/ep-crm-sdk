import path from 'node:path';
import routes from './src/app/config/service-routes.json' with { type: 'json' };

const defaultTarget = 'http://localhost:80';
const __dirname = import.meta.dirname;

try {
  const envPath = path.join(__dirname, '.env');
  process.loadEnvFile(envPath);
} catch (error) {
  if (error.code === 'ENOENT') {
    console.warn('\x1b[33m%s\x1b[0m', `[proxy] Warning: .env file not found.`);
    console.warn('\x1b[33m%s\x1b[0m', `[proxy] Default address will be used: ${defaultTarget}`);
  } else {
    console.error('[proxy] Error loading .env:', error.message);
  }
}

const target = process.env.CRM_BACKEND || defaultTarget;

const workspacePrefix = process.env.CRM_WORKSPACE ?? '';

const pathRewrite = Object.entries(routes).reduce((rewrite, [alias, route]) => {
  const prefix = route.scope === 'workspace' ? workspacePrefix : '';
  rewrite[`^/crm/${alias}(?=$|[/?])`] = `${prefix}/${route.path}`;
  return rewrite;
}, {});

const loginPagePattern = /\/Login\/Login\.html/i;

function rejectLoginRedirect(proxy) {
  proxy.on('proxyRes', (proxyRes) => {
    const status = proxyRes.statusCode;
    const location = proxyRes.headers.location || '';
    if ((status === 301 || status === 302) && loginPagePattern.test(location)) {
      proxyRes.statusCode = 401;
      delete proxyRes.headers.location;
    }
  });
  proxy.on('error', (error, request, response) => {
    const reason =
      error.message ||
      error.code ||
      error.errors?.map((nested) => nested.code ?? nested.message).join(', ') ||
      'unknown error';
    console.error(`[proxy] ${reason}: ${request?.url ?? ''} -> ${target}`);
    if (response && !response.headersSent && typeof response.writeHead === 'function') {
      response.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    response?.end?.('Bad Gateway');
  });
}

export default {
  '/crm/**': {
    target: target,
    secure: false,
    pathRewrite: pathRewrite,
    cookiePathRewrite: {
      '*': '/',
    },
    configure: rejectLoginRedirect,
  },
};
