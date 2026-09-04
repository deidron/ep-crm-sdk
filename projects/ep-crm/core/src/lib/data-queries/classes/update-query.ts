import { SerializedObject } from '../../serialization/serialized-object';
import { BaseFilterableQuery } from './base-filterable-query';
import { QueryOperationType } from '../enums/query-operation-type';
import { ColumnValues } from './column-values';
import { DataValueType } from '../../types/data-value-type';
import { ColumnExpression } from './column-expression';
import { FunctionExpression } from './function-expression';
import { ParameterExpression } from './parameter-expression';
import { BaseQueryResponse } from '../../http/contracts/base-query-response';
import { ParameterValueType } from '../types/parameter-value-type';

export class UpdateQuery extends BaseFilterableQuery<BaseQueryResponse> {
  serviceUrl: string = 'update';

  override operationType: QueryOperationType = QueryOperationType.UPDATE;

  readonly dtoTypeName: string = 'UpdateQuery';

  columnValues: ColumnValues = new ColumnValues();

  isForceUpdate: boolean = false;

  setColumnValue(sourceColumnAlias: string, columnName: string): ColumnExpression {
    return this.columnValues.setColumnValue(sourceColumnAlias, columnName);
  }

  setParameterValue(
    sourceColumnAlias: string,
    paramValue: ParameterValueType,
    parameterDataType?: DataValueType,
  ): ParameterExpression {
    return this.columnValues.setParameterValue(sourceColumnAlias, paramValue, parameterDataType);
  }

  setFunctionValue(
    sourceColumnAlias: string,
    functionValue: FunctionExpression,
  ): FunctionExpression {
    return this.columnValues.setFunctionValue(sourceColumnAlias, functionValue);
  }

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    this.validateFilters();
    serializableObject = super.prepareSerializableObject(serializableObject);
    serializableObject['columnValues'] = this.getSerializableProperty(this.columnValues);
    serializableObject['isForceUpdate'] = this.isForceUpdate;
    return serializableObject;
  }
}
