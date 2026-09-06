# @ep-crm/core

Contracts and query building for the Creatio/BPMSoft platforms. Plain TypeScript, no
framework dependency; built bundle has no external dependencies.

## Platforms

Creatio and BPMSoft: common protocol, same service addresses, same `SelectQuery` format,
same `rowConfig` in responses. Differ only in the global variable name the platform page
puts on `window` — handled by `@ep-crm/devkit`. In Creatio the global is still `Terrasoft`.

API names are platform-neutral: `PlatformUrlProvider`, `PlatformHost`, `PlatformGlobal`.

## Contents

| section          | contents                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `data-queries`   | `SelectQuery`, `InsertQuery`, `UpdateQuery`, `DeleteQuery`, `BatchQuery`, columns, expressions, filters, and their parsers |
| `http/contracts` | `Query`, `BaseResponse`, `BaseQueryResponse`, `ResponseStatus`, `ErrorInfo`                                                |
| `serialization`  | `BaseSerializableObject` — base for serialization into the DataService format                                              |
| `entities`       | `Entity`, `EntityColumnsConfig`, response-row parsing by `rowConfig`                                                       |
| `services`       | contracts/query classes for platform services: rights, processes, bulk deletion, schemas, authentication                   |
| `routing`        | `PlatformUrlProvider`, `ServiceRoute`                                                                                      |
| `types`          | `DataValueType`, `PlatformName`, `DateRenderMode` and the value types it maps                                              |
| `user`           | `UserInfo`, `CultureSettings`, `DateTimeFormatSettings`, translation of the culture's date patterns                        |
| `localization`   | `LocalizableString`, `getLocalizedString`                                                                                  |
| `exceptions`     | typed errors: argument, incomplete filters, unsupported type                                                               |
| `utils`          | date encoding/parsing in the platform format, GUID helpers                                                                 |

## Example

```ts
import {
  SelectQuery,
  FilterUtils,
  ColumnExpression,
  ParameterExpression,
  ComparisonType,
  DataValueType,
} from '@ep-crm/core';

const query = new SelectQuery('Contact');
query.addColumn('Id');
query.addColumn('Name');
query.rowCount = 10;
query.addFilter(
  'byName',
  FilterUtils.createCompareFilter(
    ComparisonType.EQUAL,
    new ColumnExpression('Name'),
    new ParameterExpression('Smith', DataValueType.TEXT),
  ),
);

const body = query.serialize(); // POST body for DataService
```

The package builds the query and parses the response only. Sending is done by
`@ep-crm/devkit` or application code.

## Dates

The platform sends dates as a string without a time zone, treated as local time.
`toLocalISOString` and `parseDate` (in `utils`) follow that convention, including dates
before 1970. A `Time` column arrives as a whole moment as well: the platform stores the
time alone and hands it back stamped with the current date, which it discards on write.

Patterns of the user culture arrive in the .NET syntax (`CultureInfo.DateTimeFormat`),
where the AM/PM designator is `tt` and a day name is `ddd`. `toCldrDatePattern` (in `user`)
translates them into the Unicode syntax that renderers read — `formatDate` from
`@angular/common` among them, which would otherwise pass `tt` through as literal text.
`dateRenderMode` (in `types`) says which halves of a moment a value type carries.

## Public surface

Root entry only — no deep paths (`@ep-crm/core/data-queries/...`). New files must add
their export to the barrel to be visible from outside the package.
