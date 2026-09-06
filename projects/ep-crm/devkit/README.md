# @ep-crm/devkit

Angular binding of [`@ep-crm/core`](../core/README.md): injectable services, transport,
runtime mode detection. Depends on Angular and the platform, not on a specific application.

## Platforms

| platform | global      | `workspaceBaseUrl` example |
| -------- | ----------- | -------------------------- |
| BPMSoft  | `BPMSoft`   | `http://localhost:1006`    |
| Creatio  | `Terrasoft` | `http://localhost:1002`    |

`getPlatformGlobal()` checks both global names. `window.creatio` (present when the platform
itself uses a devkit) is a separate module registry — it has no `workspaceBaseUrl` and is
not the platform global.

## Two runtime modes

`PlatformHost.isEmbedded` — determined once, by the presence of a global carrying
`workspaceBaseUrl`.

**Standalone.** No global. Addresses come from the application's own `PlatformUrlProvider`
(e.g. a dev-proxy alias). Application handles authentication.

**Embedded.** Global present. `WorkspaceUrlProvider` builds addresses from
`workspaceBaseUrl`. Sign-in/out is handled by the platform; the session is already open.

Provider selection:

```ts
export function createUrlProvider(host: PlatformHost): PlatformUrlProvider {
  return host.isEmbedded ? new WorkspaceUrlProvider(serviceRoutes) : new ProxyUrlProvider();
}
```

Embedded mode is exercised end to end (`getPlatformGlobal()`, `PlatformHost`,
`WorkspaceUrlProvider`, `QueryExecutor`) by the [probe bundle](../../../probe/README.md) —
see its README for results per environment. Not covered by the probe: `UPDATE`/`DELETE`
collision control (the probe only reads).

`withXsrfConfiguration` attaches the XSRF header to relative addresses only; in embedded
mode addresses from `workspaceBaseUrl` are absolute, so the header is not attached there.

## Contents

| symbol                 | purpose                                                                           |
| ---------------------- | --------------------------------------------------------------------------------- |
| `QueryExecutor`        | sends `@ep-crm/core` queries, parses responses, typed exceptions                  |
| `PlatformHost`         | runtime mode: standalone or embedded                                              |
| `WorkspaceUrlProvider` | service addresses from `workspaceBaseUrl` (embedded mode)                         |
| `UserContextService`   | current user and culture                                                          |
| `CultureDateService`   | dates and times rendered in the patterns and language of the user culture         |
| `services/`            | wrappers over platform services: rights, processes, bulk deletion, schema manager |

## Providers the application must supply

Package services are declared with `@Service()` — no `providers` registration needed, only
injection. Two tokens are not supplied by the package:

| token                 | purpose                                | if missing                                         |
| --------------------- | -------------------------------------- | -------------------------------------------------- |
| `PlatformUrlProvider` | resolves a service alias to an address | `NullInjectorError` on first request               |
| `PLATFORM_NAME`       | platform name for `__type` in a batch  | defaults to `null`; batch sent with wrong contract |

Not caught at build time. Minimal configuration:

```ts
providers: [
  { provide: PLATFORM_NAME, useValue: environment.platformName },
  { provide: PlatformUrlProvider, useFactory: createUrlProvider, deps: [PlatformHost] },
];
```

Locale data is not a token but is the application's job all the same.
`CultureDateService` formats through `formatDate`, and Angular ships data for `en-US`
alone, so every other supported culture needs `registerLocaleData` — otherwise a pattern
that spells a month or a day out throws. The service formats in the user culture when its
data is registered and in `en-US` when it is not, so a stand reporting an unknown culture
degrades rather than breaks. Which locales to bundle is the application's call.

## Session flag

Session is carried by platform cookies; the application does not receive or store a
token. `UserContextService.userInfo()` — populated by `currentUserInfo` on a valid
session — is the authorization flag itself.

Startup:

```ts
provideAppInitializer(() =>
  inject(UserContextService)
    .initialize()
    .pipe(catchError(() => of(false))),
);
```

The request carries `SESSION_PROBE` context. The application interceptor must not navigate
to the login form on this marker; the login/redirect decision belongs to the guard.

## State lifetime

Package services are application-wide singletons; state does not reset on user change. On
sign-out, the application must call `UserContextService.destroy()`,
`RightsService.clearCache()` and `EntitySchemaManager.clearCache()` — schemas are read
under the rights of the user who asked for them. Do not call `destroy()` on section
navigation — it is equivalent to signing out.

## Service route list

`WorkspaceUrlProvider` takes the route list as a constructor argument.

| field      | meaning                                                            |
| ---------- | ------------------------------------------------------------------ |
| `path`     | service address relative to the platform root                      |
| `scope`    | `workspace` (routed through the workspace number) or `application` |
| `embedded` | `false` — service must not be called from a platform page          |

Authentication is `scope: application` (outside any workspace). `/0/...` workspace aliases
are not available for every service — a missing alias returns 404 through the workspace
prefix.

`workspaceBaseUrl` may or may not include `/0` depending on environment
(`http://localhost:1003/0` vs. `http://localhost:1002`); workspace-scope requests use it
unchanged. Application-scope requests use `loaderBaseUrl`.

`embedded: false` marks the authentication service: calling it in embedded mode
re-authenticates over an already-open session and is treated as an error, not a fallback.

## Build

Built against the built `@ep-crm/core` (see `tsconfig.lib.json`), not its sources. Build
order: `core`, then `devkit`.
