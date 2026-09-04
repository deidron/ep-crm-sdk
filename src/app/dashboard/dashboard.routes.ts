import { Routes } from '@angular/router';
import { entitySchemaResolver } from '@app/entity-schema/entity-schema-resolver';
import { EntitySchemaPage } from '@app/entity-schema/entity-schema-page/entity-schema-page';
import { EntitySchemaSection } from '@app/entity-schema/entity-schema-section/entity-schema-section';
import { Dashboard } from '@app/dashboard/dashboard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: Dashboard,
    resolve: {
      schemas: entitySchemaResolver,
    },
    children: [
      { path: ':schemaName', component: EntitySchemaSection },
      { path: ':schemaName/edit/:id', component: EntitySchemaPage },
    ],
  },
];
