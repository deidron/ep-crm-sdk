import { FunctionType } from '../enums/function-type';
import { BaseExpression } from './base-expression';
import { FunctionExpression } from './function-expression';

export class WindowFunctionExpression extends FunctionExpression {
  constructor(functionArgument: BaseExpression) {
    super();
    this.functionType = FunctionType.WINDOW;
    this.functionArgument = functionArgument;
  }
}
