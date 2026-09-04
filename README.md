# EP CRM Demo

Angular workspace for the Creatio/BPMSoft platforms.

| project                                              | contents                                                                                                                   |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [`@ep-crm/core`](projects/ep-crm/core/README.md)     | Plain TypeScript: query building, entity/response parsing, platform service contracts.                                     |
| [`@ep-crm/devkit`](projects/ep-crm/devkit/README.md) | Angular bindings for `@ep-crm/core`: injectable `QueryExecutor`, session/user context, standalone/embedded mode detection. |
| `ep-crm-demo` (`src/`)                               | Demo application: sign-in, dashboard with entity-schema browsing, user profile, i18n, loading/error UI.                    |
| [`ep-crm-probe`](probe/README.md)                    | Interface-less diagnostic bundle that runs `@ep-crm/core`/`@ep-crm/devkit` inside a Creatio/BPMSoft page.                  |

Creatio and BPMSoft share one HTTP protocol; the platform page exposes a different global
variable name (`Terrasoft` for Creatio, `BPMSoft` for BPMSoft). The platform name for a
standalone build is set in `src/environments`; in embedded mode it is detected from the
global — see `@ep-crm/devkit`, ["Two runtime modes"](projects/ep-crm/devkit/README.md#two-runtime-modes).

The demo application runs standalone, against the dev proxy, and is not embedded into a
platform page. Sign-in is not handled by the app: the session is a platform cookie, and
`UserContextService.userInfo()` is the authorization flag — see
["The session flag"](projects/ep-crm/devkit/README.md#the-session-flag).

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.5.

## Development server

```bash
ng serve
```

Serves at `http://localhost:4200/` with reload on source changes.

## Code scaffolding

```bash
ng generate component component-name
ng generate --help
```

## Naming conventions

Angular v20+ style guide, "intent over role": a file is named after the one thing it
exports, kebab-case; the folder states the kind.

```
src/app/user-profile/user-profile.ts             class UserProfile        (component)
src/app/user-profile/user-profile-store.ts       class UserProfileStore   (state + queries)
src/app/user-profile/user-profile-data.model.ts  interface UserProfileData
src/app/authorization/authorization.ts           class AuthorizationService
src/app/authorization/login-guard.ts             const loginGuard
```

- No `.component.ts` / `.service.ts` / `.directive.ts` suffixes, no `Component` suffix on
  component classes. Services keep the `Service` class suffix (`auth.ts` → `AuthService`).
- Split templates/styles share the base name: `dashboard.ts`, `dashboard.html`, `dashboard.css`,
  `dashboard.spec.ts`.
- Guards, resolvers, interceptors: hyphen, named after the exported symbol —
  `login-guard.ts`, `entity-schema-resolver.ts`, `platform-interceptor.ts`.
- Route tables: `.routes.ts` (`app.routes.ts`, `dashboard.routes.ts`).
- A module exporting a set of functions is named for what it holds: `date-utils.ts`,
  `guid-utils.ts`, `entity-deserializer.ts`.
- `angular.json` pins `type: ''` for component/directive/service schematics.
- Exceptions: `@ep-crm/core` DTOs under `dto/`, `contracts/`, `interfaces/`, `enums/` keep plain
  names (no `.model.ts`); `.model.ts` is used only in the application. Exception classes keep
  `.exception.ts` (`argument.exception.ts`, `invalid-response.exception.ts`).

## Building

```bash
ng build
```

Artifacts go to `dist/`. Production build is optimized by default.

## Running unit tests

```bash
ng test
```

Runner: [Vitest](https://vitest.dev/).

## Linting

```bash
pnpm lint
```

Full pass — [angular-eslint](https://github.com/angular-eslint/angular-eslint) with template
accessibility rules, all four projects plus `eslint.config.mjs`, `proxy.config.mjs`,
`server/sync-routes.mjs`. This is also what `pnpm test` runs.

Per-project lint:

```bash
ng lint @ep-crm/core
```

`ng lint` without a project name runs all four projects in sequence (separate ESLint per
project; does not cover the three root files).

Rule set: `tsRecommended` plus signal rules (`no-uncalled-signals`, `prefer-signals`,
`prefer-signal-model`, `prefer-output-emitter-ref`, `computed-must-return`), lifecycle/DI rules
(`no-async-lifecycle-method`, `require-lifecycle-on-prototype`, `inject-at-top`,
`use-injectable-provided-in`, `prefer-service-decorator`), and ~20 template rules. Disabled:
`template/no-call-expression`, `template/i18n` (+ `$localize` companions), `template/cyclomatic-complexity`.

Selector prefixes (per `angular.json`): `app` for the application, `ep` for both libraries. The
probe sets none.

## Service routes

`src/app/config/service-routes.json` is the single list of platform services. The dev proxy
rewrites, `server/nginx.conf`, and `server/web.config` are generated from it. After changing the
JSON:

```bash
pnpm routes:sync
```

`pnpm test` fails if the generated maps are out of sync.

The workspace prefix is in none of the generated maps: it is a property of the stand — an
application on .NET Core answers without one, an application on .NET Framework answers under a
numbered workspace — and only the services with scope `workspace` ever get it. The dev proxy reads
it from `CRM_WORKSPACE` in `.env`; nginx substitutes the same variable at container start; IIS has
no substitution of its own and keeps it in the `Workspace` rewriteMap of `server/web.config`, one
commented-out line next to the backend address. Empty everywhere by default.

## Running end-to-end tests

```bash
ng e2e
```

No e2e framework is configured by default.

## Additional Resources

[Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
