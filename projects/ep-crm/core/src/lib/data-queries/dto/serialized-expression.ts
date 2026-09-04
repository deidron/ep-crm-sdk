import { DataValueType } from '../../types/data-value-type';
import { AggregationEvalType } from '../enums/aggregation-eval-type';
import { AggregationType } from '../enums/aggregation-type';
import { ArithmeticOperation } from '../enums/arithmetic-operation';
import { DatePartType } from '../enums/date-part-type';
import { ExpressionType } from '../enums/expression-type';
import { FunctionType } from '../enums/function-type';
import { OrderDirection } from '../enums/order-direction';
import { QueryMacrosType } from '../enums/query-macros-type';
import { ParameterValueType } from '../types/parameter-value-type';
import { SerializedFilterGroup } from './serialized-filter';

export interface SerializedParameter {
  dataValueType: DataValueType;
  value: ParameterValueType;
}

export interface SerializedColumnExpression {
  expressionType: ExpressionType.SCHEMA_COLUMN;
  columnPath: string;
}

export interface SerializedParameterExpression {
  expressionType: ExpressionType.PARAMETER;
  parameter?: SerializedParameter;
}

export interface SerializedArithmeticExpression {
  expressionType: ExpressionType.ARITHMETIC_OPERATION;
  arithmeticOperation: ArithmeticOperation;
  leftArithmeticOperand: SerializedExpression;
  rightArithmeticOperand: SerializedExpression;
}

export interface SerializedSubQueryExpression {
  expressionType: ExpressionType.SUBQUERY;
  columnPath: string;
  subFilters?: SerializedFilterGroup;
  subOrderDirection?: OrderDirection;
  subOrderColumn?: string;
  aggregationType?: AggregationType;
  functionType?: FunctionType;
}

export type SerializedFunctionArgument = SerializedExpression | string | number | null;

interface SerializedFunctionExpressionBase {
  expressionType: ExpressionType.FUNCTION;
  functionArgument?: SerializedFunctionArgument;
}

export interface SerializedMacrosFunctionExpression extends SerializedFunctionExpressionBase {
  functionType: FunctionType.MACROS;
  macrosType: QueryMacrosType;
}

export interface SerializedLengthFunctionExpression extends SerializedFunctionExpressionBase {
  functionType: FunctionType.LENGTH;
}

export interface SerializedWindowFunctionExpression extends SerializedFunctionExpressionBase {
  functionType: FunctionType.WINDOW;
}

export interface SerializedAggregationFunctionExpression extends SerializedFunctionExpressionBase {
  functionType: FunctionType.AGGREGATION;
  aggregationType: AggregationType;
  aggregationEvalType: AggregationEvalType;
}

export interface SerializedDateFunctionExpression extends SerializedFunctionExpressionBase {
  functionType:
    FunctionType.DATE_PART | FunctionType.DATE_ADD | FunctionType.DATE_DIFF | FunctionType.NONE;
  datePartType?: DatePartType;
}

export type SerializedFunctionExpression =
  | SerializedMacrosFunctionExpression
  | SerializedLengthFunctionExpression
  | SerializedWindowFunctionExpression
  | SerializedAggregationFunctionExpression
  | SerializedDateFunctionExpression;

export type SerializedExpression =
  | SerializedColumnExpression
  | SerializedParameterExpression
  | SerializedArithmeticExpression
  | SerializedSubQueryExpression
  | SerializedFunctionExpression;
