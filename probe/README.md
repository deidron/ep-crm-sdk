# The probe bundle

Diagnostic bundle that checks `@ep-crm/core` and `@ep-crm/devkit` on a live platform page.
Renders nothing; raises its own Angular injector, takes the packages' services out of it,
and calls the real platform services.

Not part of the demo application (which is not embedded). Checks: presence of the platform
global, actual shape of `workspaceBaseUrl`, whether `workspace` addresses resolve, whether
the XSRF header reaches the server.

**Read-only.** Every request is a `SelectQuery` over `Contact`; no insert/update/delete.

## Build

```bash
pnpm build:probe
```

Output: `dist/probe` — no lazy chunks, no styles, no `index.html`. Bundle carries its own
Angular; platform's Angular version is irrelevant.

| file              | format | use                                      |
| ----------------- | ------ | ---------------------------------------- |
| `ep-crm-probe.js` | IIFE   | platform loader: `bootstraps`, `require` |
| `main.js`         | ESM    | direct `import()` in the console         |

Both expose the same `EpCrmProbe` global (entry-point exports are stripped by the
application builder).

## Deploy

Package layout, from `probe/platform-package`:

```
EpCrmDemo/
  Files/
    descriptor.json          → { "bootstraps": ["src/js/bootstrap.js"] }
    src/js/bootstrap.js      → registers the path and the shim of the bundle
    src/js/ep-crm-probe.js   → dist/probe/ep-crm-probe.js
```

`bootstrap.js` only registers the module in the loader; the bundle is fetched on first
`require`. Registration does not start it.

The ESM bundle cannot be used for `bootstraps` (platform loads bootstrap scripts as
non-module scripts; `export` there is a syntax error) — use the IIFE build.

## Run

In the console of a platform page:

```javascript
require(['ep-crm-probe'], (probe) => probe.run());
```

Without a package, if served by the same host:

```javascript
await import('/path/to/main.js');
await EpCrmProbe.run();
```

## Reading the result

A table of checks is printed to the console with per-check details. Checks are
independent — one failure does not stop the others.

| check                       | failure means                                                      |
| --------------------------- | ------------------------------------------------------------------ |
| `platform global`           | no `BPMSoft`/`Terrasoft` global on the page — embedded mode is off |
| `PlatformHost`              | mode or platform name detected incorrectly                         |
| `url resolution`            | `workspace` route addresses built incorrectly                      |
| `xsrf: cookie and address`  | whether Angular sends the `BPMCSRF` header                         |
| `currentUserInfo`           | platform session does not reach the request                        |
| `SelectQuery`               | query build, send, or response parse failed                        |
| `BatchQuery __type`         | platform name in the batch item contract is wrong                  |
| `raw fetch with the header` | same request made manually, for comparison                         |

`SelectQuery` failing while `raw fetch with the header` succeeds indicates a missing XSRF
header rather than an address or session problem (Angular attaches the header to relative
URLs only; embedded-mode addresses from `workspaceBaseUrl` may be absolute).

## Results by environment

All eight checks pass on every environment listed.

| environment | global      | `workspaceBaseUrl`        | batch `__type`     |
| ----------- | ----------- | ------------------------- | ------------------ |
| Creatio     | `Terrasoft` | `http://localhost:1002`   | `Terrasoft.Nui...` |
| Creatio     | `Terrasoft` | `http://localhost:1003/0` | `Terrasoft.Nui...` |
| BPMSoft     | `BPMSoft`   | `http://localhost:1006`   | `BPMSoft.Nui...`   |

Session was valid on all environments without login (`currentUserInfo` answered directly).
XSRF header (`headerWillBeSent`) was `false` on all environments; all requests were
accepted regardless.

Not covered: `UPDATE`/`DELETE` collision control on BPMSoft (probe is read-only).
