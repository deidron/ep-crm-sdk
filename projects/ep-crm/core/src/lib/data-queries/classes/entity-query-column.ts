import { BaseQueryColumn } from './base-query-column';
import { ColumnExpression } from './column-expression';

export class EntityQueryColumn extends BaseQueryColumn {
  columnPath: string = '';

  constructor(columnPath: string) {
    super(new ColumnExpression(columnPath));
    this.columnPath = columnPath;
  }
}
