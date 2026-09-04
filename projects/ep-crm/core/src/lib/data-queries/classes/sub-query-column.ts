import { BaseQueryColumn } from './base-query-column';
import { FilterGroup } from './filter-group';
import { SubQueryExpression } from './sub-query-expression';

export class SubQueryColumn extends BaseQueryColumn {
  constructor(columnPath: string, subFilters?: FilterGroup) {
    super(new SubQueryExpression(columnPath, subFilters));
  }
}
