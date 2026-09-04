import { DataValueType } from '../../types/data-value-type';
import { InsertQuery } from './insert-query';
import { MacrosFunctionExpression } from './macros-function-expression';
import { QueryMacrosType } from '../enums/query-macros-type';
import { UpdateQuery } from './update-query';

function columnValues(
  query: InsertQuery | UpdateQuery,
): Record<string, { expressionType: number }> {
  return JSON.parse(query.serialize())['columnValues']['items'];
}

describe('Column values', () => {
  it('insert: a value from another column', () => {
    const query: InsertQuery = new InsertQuery('Contact');
    query.setColumnValue('Name', 'Account.Name');

    const values = columnValues(query);

    expect(values['Name']).toMatchObject({ columnPath: 'Account.Name' });
  });

  it('insert: a function value', () => {
    const query: InsertQuery = new InsertQuery('Activity');
    query.setFunctionValue(
      'Owner',
      new MacrosFunctionExpression(QueryMacrosType.CURRENT_USER_CONTACT),
    );

    const values = columnValues(query);

    expect(values['Owner']).toMatchObject({ macrosType: QueryMacrosType.CURRENT_USER_CONTACT });
  });

  it('update: a value from another column', () => {
    const query: UpdateQuery = new UpdateQuery('Contact');
    query.setColumnValue('Phone', 'MobilePhone');

    const values = columnValues(query);

    expect(values['Phone']).toMatchObject({ columnPath: 'MobilePhone' });
  });

  it('update: a function value', () => {
    const query: UpdateQuery = new UpdateQuery('Activity');
    query.setFunctionValue('DueDate', new MacrosFunctionExpression(QueryMacrosType.TODAY));

    const values = columnValues(query);

    expect(values['DueDate']).toMatchObject({ macrosType: QueryMacrosType.TODAY });
  });

  it('rejects a parameter without a declared type', () => {
    const query: InsertQuery = new InsertQuery('Contact');

    expect(() => query.setParameterValue('Name', 'Smith')).toThrow(/parameterDataType/);
  });

  it('puts a typed parameter into the query', () => {
    const query: InsertQuery = new InsertQuery('Contact');
    query.setParameterValue('Name', 'Smith', DataValueType.TEXT);

    const values = columnValues(query);

    expect(values['Name']).toHaveProperty('parameter');
  });
});
