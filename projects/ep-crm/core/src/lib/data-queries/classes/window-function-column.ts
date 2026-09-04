import { BaseExpression } from './base-expression';
import { BaseQueryColumn } from './base-query-column';
import { WindowFunctionExpression } from './window-function-expression';

export class WindowFunctionColumn extends BaseQueryColumn {
  constructor(functionArgument: BaseExpression) {
    super(new WindowFunctionExpression(functionArgument));
  }
}
