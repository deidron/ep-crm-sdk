import { SerializedObject } from '../../serialization/serialized-object';
import { BaseQuery } from './base-query';
import { QueryOperationType } from '../enums/query-operation-type';
import { ColumnValues } from './column-values';
import { DataValueType } from '../../types/data-value-type';
import { ColumnExpression } from './column-expression';
import { FunctionExpression } from './function-expression';
import { ParameterExpression } from './parameter-expression';
import { InsertQueryResponse } from '../interfaces/insert-query-response';
import { ParameterValueType } from '../types/parameter-value-type';

export class InsertQuery extends BaseQuery<InsertQueryResponse> {
  serviceUrl: string = 'insert';

  override operationType: QueryOperationType = QueryOperationType.INSERT;

  readonly dtoTypeName: string = 'InsertQuery';

  columnValues: ColumnValues = new ColumnValues();

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
    serializableObject = super.prepareSerializableObject(serializableObject);
    serializableObject['columnValues'] = this.getSerializableProperty(this.columnValues);
    return serializableObject;
  }
}
