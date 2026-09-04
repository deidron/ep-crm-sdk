import { SerializedObject } from '../../serialization/serialized-object';
import { BaseExpression } from './base-expression';
import { ExpressionType } from '../enums/expression-type';
import { DataValueType } from '../../types/data-value-type';
import { Parameter } from './parameter';
import { BaseFilter } from './base-filter';
import { ParameterValueType } from '../types/parameter-value-type';

export class ParameterExpression extends BaseExpression {
  override expressionType: ExpressionType = ExpressionType.PARAMETER;

  private _parameterDataType: DataValueType = DataValueType.TEXT;

  private _parameterValue: ParameterValueType = null;

  parameter: Parameter | null = null;

  parentFilter: BaseFilter | null = null;

  get parameterDataType() {
    return this._parameterDataType;
  }

  set parameterDataType(value: DataValueType) {
    this._parameterDataType = value;
    if (this.parameter === null) {
      this.parameter = new Parameter();
    }
    this.parameter.dataValueType = this._parameterDataType;
  }

  get parameterValue() {
    return this._parameterValue;
  }

  set parameterValue(value: ParameterValueType) {
    this._parameterValue = value;
    if (this.parameter === null) {
      this.parameter = new Parameter();
    }
    this.parameter.value = this._parameterValue;
  }

  constructor(parameterValue?: ParameterValueType, parameterDataType?: DataValueType) {
    super();
    if (typeof parameterValue !== 'undefined') {
      this.parameterValue = parameterValue;
    }
    if (typeof parameterDataType !== 'undefined') {
      this.parameterDataType = parameterDataType;
    }
  }

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    serializableObject = super.prepareSerializableObject(serializableObject);
    serializableObject['parameter'] = this.getSerializableProperty(this.parameter);
    return serializableObject;
  }
}
