import { SerializedObject } from '../../serialization/serialized-object';
import { ArithmeticOperation } from '../enums/arithmetic-operation';
import { ExpressionType } from '../enums/expression-type';
import { BaseExpression } from './base-expression';

export class ArithmeticExpression extends BaseExpression {
  override expressionType: ExpressionType = ExpressionType.ARITHMETIC_OPERATION;

  arithmeticOperation: ArithmeticOperation;

  leftArithmeticOperand: BaseExpression;

  rightArithmeticOperand: BaseExpression;

  constructor(
    arithmeticOperation: ArithmeticOperation,
    leftArithmeticOperand: BaseExpression,
    rightArithmeticOperand: BaseExpression,
  ) {
    super();
    this.arithmeticOperation = arithmeticOperation;
    this.leftArithmeticOperand = leftArithmeticOperand;
    this.rightArithmeticOperand = rightArithmeticOperand;
  }

  protected override prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject {
    serializableObject = super.prepareSerializableObject(serializableObject);
    serializableObject['arithmeticOperation'] = this.arithmeticOperation;
    serializableObject['leftArithmeticOperand'] = this.getSerializableProperty(
      this.leftArithmeticOperand,
    );
    serializableObject['rightArithmeticOperand'] = this.getSerializableProperty(
      this.rightArithmeticOperand,
    );
    return serializableObject;
  }
}
