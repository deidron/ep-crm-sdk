import { ArgumentNullOrEmptyException } from '../../exceptions/argument.exception';
import { UnsupportedTypeException } from '../../exceptions/unsupported-type.exception';
import { ExpressionType } from '../enums/expression-type';
import { FunctionType } from '../enums/function-type';
import {
  SerializedArithmeticExpression,
  SerializedExpression,
  SerializedFunctionArgument,
  SerializedFunctionExpression,
  SerializedParameterExpression,
  SerializedSubQueryExpression,
} from '../dto/serialized-expression';
import { AggregationFunctionExpression } from './aggregation-function-expression';
import { AggregationSubQueryExpression } from './aggregation-sub-query-expression';
import { ArithmeticExpression } from './arithmetic-expression';
import { BaseExpression } from './base-expression';
import { ColumnExpression } from './column-expression';
import { FilterGroup } from './filter-group';
import { FilterParser } from './filter-parser';
import { FunctionExpression } from './function-expression';
import { LengthFunctionExpression } from './length-function-expression';
import { MacrosFunctionExpression } from './macros-function-expression';
import { ParameterExpression } from './parameter-expression';
import { SubQueryExpression } from './sub-query-expression';
import { WindowFunctionExpression } from './window-function-expression';

export class ExpressionParser {
  static fromJson(dto: SerializedExpression): BaseExpression {
    if (!dto) {
      throw new ArgumentNullOrEmptyException('dto');
    }
    switch (dto.expressionType) {
      case ExpressionType.SCHEMA_COLUMN:
        return new ColumnExpression(dto.columnPath);
      case ExpressionType.PARAMETER:
        return this.parseParameter(dto);
      case ExpressionType.SUBQUERY:
        return this.parseSubQuery(dto);
      case ExpressionType.ARITHMETIC_OPERATION:
        return this.parseArithmetic(dto);
      case ExpressionType.FUNCTION:
        return this.parseFunction(dto);
      default: {
        const unsupported: never = dto;
        throw new UnsupportedTypeException(
          'expressionType',
          (unsupported as SerializedExpression).expressionType,
        );
      }
    }
  }

  private static parseArgument(
    dto: SerializedFunctionArgument | undefined,
  ): BaseExpression | string | number | undefined {
    if (dto === null || typeof dto === 'undefined') {
      return undefined;
    }
    return typeof dto === 'object' ? this.fromJson(dto) : dto;
  }

  private static parseParameter(dto: SerializedParameterExpression): ParameterExpression {
    let value = dto.parameter?.value;

    if (
      typeof value === 'string' &&
      value.length > 1 &&
      value.startsWith('"') &&
      value.endsWith('"')
    ) {
      value = value.slice(1, -1);
    }
    return new ParameterExpression(value, dto.parameter?.dataValueType);
  }

  private static parseArithmetic(dto: SerializedArithmeticExpression): ArithmeticExpression {
    return new ArithmeticExpression(
      dto.arithmeticOperation,
      this.fromJson(dto.leftArithmeticOperand),
      this.fromJson(dto.rightArithmeticOperand),
    );
  }

  private static parseSubQuery(dto: SerializedSubQueryExpression): SubQueryExpression {
    const subFilters: FilterGroup | undefined = dto.subFilters
      ? (FilterParser.fromJson(dto.subFilters) as FilterGroup)
      : undefined;
    if (typeof dto.aggregationType === 'undefined') {
      return new SubQueryExpression(
        dto.columnPath,
        subFilters,
        dto.subOrderDirection,
        dto.subOrderColumn,
      );
    }
    return new AggregationSubQueryExpression(
      dto.columnPath,
      dto.aggregationType,
      subFilters,
      dto.subOrderDirection,
      dto.subOrderColumn,
      dto.functionType,
    );
  }

  private static parseFunction(dto: SerializedFunctionExpression): FunctionExpression {
    const argument = this.parseArgument(dto.functionArgument);
    switch (dto.functionType) {
      case FunctionType.MACROS:
        return new MacrosFunctionExpression(
          dto.macrosType,
          argument as BaseExpression | number | undefined,
        );
      case FunctionType.LENGTH:
        return new LengthFunctionExpression(argument as BaseExpression);
      case FunctionType.WINDOW:
        return new WindowFunctionExpression(argument as BaseExpression);
      case FunctionType.AGGREGATION:
        return new AggregationFunctionExpression(
          dto.aggregationType,
          dto.aggregationEvalType,
          argument as BaseExpression,
        );
      default:
        return this.parseDateFunction(dto, argument);
    }
  }

  private static parseDateFunction(
    dto: Extract<SerializedFunctionExpression, { datePartType?: unknown }>,
    argument: BaseExpression | string | number | undefined,
  ): FunctionExpression {
    const expression: FunctionExpression = new FunctionExpression();
    expression.functionType = dto.functionType;
    expression.datePartType = dto.datePartType;
    expression.functionArgument = argument;
    return expression;
  }
}
