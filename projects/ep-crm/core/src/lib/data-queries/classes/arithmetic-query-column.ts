import { ArithmeticOperation } from '../enums/arithmetic-operation';
import { ArithmeticExpression } from './arithmetic-expression';
import { BaseExpression } from './base-expression';
import { BaseQueryColumn } from './base-query-column';

export class ArithmeticQueryColumn extends BaseQueryColumn {
  constructor(
    arithmeticOperation: ArithmeticOperation,
    leftArithmeticOperand: BaseExpression,
    rightArithmeticOperand: BaseExpression,
  ) {
    super(
      new ArithmeticExpression(arithmeticOperation, leftArithmeticOperand, rightArithmeticOperand),
    );
  }
}
