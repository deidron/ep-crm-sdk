import { BaseExpression } from './base-expression';
import { BaseQueryColumn } from './base-query-column';
import { LengthFunctionExpression } from './length-function-expression';

export class LengthFunctionColumn extends BaseQueryColumn {
  constructor(functionArgument: BaseExpression) {
    super(new LengthFunctionExpression(functionArgument));
  }
}
