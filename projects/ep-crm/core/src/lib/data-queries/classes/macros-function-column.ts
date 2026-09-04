import { QueryMacrosType } from '../enums/query-macros-type';
import { BaseExpression } from './base-expression';
import { BaseQueryColumn } from './base-query-column';
import { MacrosFunctionExpression } from './macros-function-expression';

export class MacrosFunctionColumn extends BaseQueryColumn {
  constructor(macrosType: QueryMacrosType, functionArgument?: BaseExpression | number) {
    super(new MacrosFunctionExpression(macrosType, functionArgument));
  }
}
