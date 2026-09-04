import { FunctionType } from '../enums/function-type';
import { QueryMacrosType } from '../enums/query-macros-type';
import { BaseExpression } from './base-expression';
import { FunctionExpression } from './function-expression';

export class MacrosFunctionExpression extends FunctionExpression {
  constructor(macrosType: QueryMacrosType, functionArgument?: BaseExpression | number) {
    super();
    this.functionType = FunctionType.MACROS;
    this.macrosType = macrosType;
    this.functionArgument = functionArgument;
  }
}
