import { SerializedObject } from '../../serialization/serialized-object';
import { ArgumentNullOrEmptyException } from '../../exceptions/argument.exception';
import { BaseSerializableObject } from '../../serialization/base-serializable-object';
import { BaseExpression } from './base-expression';
import { ColumnExpression } from './column-expression';
import { FunctionExpression } from './function-expression';
import { ParameterExpression } from './parameter-expression';
import { DataValueType } from '../../types/data-value-type';
import { ParameterValueType } from '../types/parameter-value-type';

export class ColumnValues extends BaseSerializableObject {
  collection: Map<string, BaseExpression> = new Map<string, BaseExpression>();

  setColumnValue(sourceColumnAlias: string, columnName: string): ColumnExpression {
    const columnValue: ColumnExpression = new ColumnExpression(columnName);
    this.collection.set(sourceColumnAlias, columnValue);
    return columnValue;
  }

  setParameterValue(
    sourceColumnAlias: string,
    paramValue: ParameterValueType,
    parameterDataType?: DataValueType,
  ): ParameterExpression {
    if (parameterDataType === undefined) {
      throw new ArgumentNullOrEmptyException('parameterDataType');
    }
    const parameterValue: ParameterExpression = new ParameterExpression();
    parameterValue.parameterValue = paramValue;
    parameterValue.parameterDataType = parameterDataType;
    this.collection.set(sourceColumnAlias, parameterValue);
    return parameterValue;
  }

  setFunctionValue(
    sourceColumnAlias: string,
    functionValue: FunctionExpression,
  ): FunctionExpression {
    this.collection.set(sourceColumnAlias, functionValue);
    return functionValue;
  }

  protected prepareSerializableObject(serializableObject: SerializedObject): SerializedObject {
    const items: SerializedObject = {};
    this.collection.forEach((value, key) => {
      items[key] = this.getSerializableProperty(value);
    });
    serializableObject['items'] = items;
    return serializableObject;
  }
}
