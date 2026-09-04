import { SerializedObject } from '../../serialization/serialized-object';
import { deserializeEntities } from '../../entities/entity-deserializer';
import { BaseFilterableQuery } from './base-filterable-query';
import { QueryColumns } from './query-columns';
import { EntityQueryColumn } from './entity-query-column';
import { BaseQueryColumn } from './base-query-column';
import { SelectQueryResponse } from '../interfaces/select-query-response';
import { QueryOperationType } from '../enums/query-operation-type';

export class SelectQuery extends BaseFilterableQuery<SelectQueryResponse> {
  serviceUrl: string = 'select';

  operationType: QueryOperationType = QueryOperationType.SELECT;

  readonly dtoTypeName: string = 'SelectQuery';

  columns: QueryColumns = new QueryColumns();

  allColumns: boolean = false;

  isDistinct: boolean = false;

  ignoreDisplayValues: boolean = false;

  rowCount: number = -1;

  rowsOffset: number = -1;

  chunkSize: number = -1;

  defaultPrimaryColumnName: string = 'Id';

  isPageable: boolean = false;

  isHierarchical: boolean = false;

  hierarchicalMaxDepth: number = 0;

  hierarchicalColumnName: string = '';

  hierarchicalColumnValue: string = '';

  useLocalization: boolean = true;

  useRecordDeactivation: boolean = false;

  queryOptimize: boolean = false;

  useReExecute: boolean = false;

  useMetrics: boolean = false;

  addColumn(column: string | EntityQueryColumn, columnAlias?: string) {
    return this.columns.addColumn(column, columnAlias);
  }

  addQueryColumn<T extends BaseQueryColumn>(column: T, columnAlias: string): T {
    return this.columns.addQueryColumn(column, columnAlias);
  }

  override parseResponse(
    response: SelectQueryResponse,
    callback?: (response: SelectQueryResponse) => void,
  ): void {
    if (response?.rows && response.rowConfig) {
      response.rows = deserializeEntities(response.rowConfig, response.rows);
    }
    super.parseResponse(response, callback);
  }

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    serializableObject = super.prepareSerializableObject(serializableObject);
    serializableObject['columns'] = this.getSerializableProperty(this.columns);
    serializableObject['isDistinct'] = this.isDistinct;
    serializableObject['rowCount'] = this.rowCount;
    serializableObject['rowsOffset'] = this.rowsOffset;
    serializableObject['isPageable'] = this.isPageable;
    serializableObject['allColumns'] = this.allColumns;
    serializableObject['useLocalization'] = this.useLocalization;
    serializableObject['useRecordDeactivation'] = this.useRecordDeactivation;
    serializableObject['isHierarchical'] = this.isHierarchical;
    if (this.isHierarchical) {
      serializableObject['hierarchicalMaxDepth'] = this.hierarchicalMaxDepth;
      serializableObject['hierarchicalColumnName'] = this.hierarchicalColumnName;
      serializableObject['hierarchicalColumnValue'] = this.hierarchicalColumnValue;
    }
    return serializableObject;
  }
}
