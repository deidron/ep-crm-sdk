import { SerializedObject } from '../../serialization/serialized-object';
import { ArgumentNullOrEmptyException } from '../../exceptions/argument.exception';
import { BaseSerializableObject } from '../../serialization/base-serializable-object';
import { BaseQueryColumn } from './base-query-column';
import { EntityQueryColumn } from './entity-query-column';

export class QueryColumns extends BaseSerializableObject {
  collection: Map<string, BaseQueryColumn> = new Map<string, BaseQueryColumn>();

  addColumn(column: string | EntityQueryColumn, columnAlias?: string): EntityQueryColumn {
    const newColumn: [EntityQueryColumn, string] =
      column instanceof EntityQueryColumn
        ? this.getEntityQueryColumn(column, columnAlias)
        : this.createEntityQueryColumn(column, columnAlias);
    const [queryColumn, alias] = newColumn;
    this.collection.set(alias, queryColumn);
    return queryColumn;
  }

  addQueryColumn<T extends BaseQueryColumn>(column: T, columnAlias: string): T {
    if (this.isEmptyString(columnAlias)) {
      throw new ArgumentNullOrEmptyException('columnAlias');
    }
    this.collection.set(columnAlias, column);
    return column;
  }

  protected prepareSerializableObject(serializableObject: SerializedObject): SerializedObject {
    const items: SerializedObject = {};
    this.collection.forEach((value, key) => {
      items[key] = this.getSerializableProperty(value);
    });
    serializableObject['items'] = items;
    return serializableObject;
  }

  private getEntityQueryColumn(
    column: EntityQueryColumn,
    columnAlias?: string,
  ): [EntityQueryColumn, string] {
    if (this.isEmptyString(columnAlias)) {
      throw new ArgumentNullOrEmptyException('columnAlias');
    }
    return [column, columnAlias as string];
  }

  private createEntityQueryColumn(
    column: string,
    columnAlias?: string,
  ): [EntityQueryColumn, string] {
    const newColumn: EntityQueryColumn = new EntityQueryColumn(column);
    columnAlias = this.isEmptyString(columnAlias) ? column : columnAlias;
    return [newColumn, columnAlias as string];
  }

  private isEmptyString(value?: string): boolean {
    return typeof value === 'undefined' || !value;
  }
}
