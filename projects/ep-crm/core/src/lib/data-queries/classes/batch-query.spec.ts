import { BatchQueryResponse } from '../interfaces/batch-query-response';
import { DataValueType } from '../../types/data-value-type';
import { PlatformName } from '../../types/platform-name';
import { BatchQuery } from './batch-query';
import { SelectQuery } from './select-query';
import { SelectQueryResponse } from '../interfaces/select-query-response';

function batchResponse(rows: Record<string, unknown>[]) {
  const response = {
    hasErrors: false,
    queryResults: [
      {
        rowConfig: { CreatedOn: { dataValueType: DataValueType.DATE_TIME } },
        rows,
      },
    ],
  };
  return response as unknown as BatchQueryResponse & typeof response;
}

function selectBatch(): { batch: BatchQuery; select: SelectQuery } {
  const select: SelectQuery = new SelectQuery('Contact');
  select.addColumn('CreatedOn');
  const batch: BatchQuery = new BatchQuery(PlatformName.Terrasoft);
  return { batch, select };
}

describe('BatchQuery', () => {
  it('parses a nested response even without a sub-query callback', () => {
    const { batch, select } = selectBatch();
    batch.add(select);
    const response = batchResponse([{ CreatedOn: '2019-06-05T15:43:29.234' }]);

    batch.parseResponse(response);

    expect(response.queryResults[0].rows[0]['CreatedOn']).toBeInstanceOf(Date);
  });

  it('passes the parsed response to the sub-query callback', () => {
    const { batch, select } = selectBatch();
    const callback = vi.fn();
    batch.add(select, callback);

    batch.parseResponse(batchResponse([{ CreatedOn: '2019-06-05T15:43:29.234' }]));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].rows[0]['CreatedOn']).toBeInstanceOf(Date);
  });

  it('notices that the server returned fewer results than there were queries', () => {
    const { batch, select } = selectBatch();
    batch.add(select);
    batch.add(new SelectQuery('Account'));

    expect(() => batch.parseResponse(batchResponse([]))).toThrow(/2 queries.*server returned 1/);
  });

  it('marks every item with the contract of the chosen platform', () => {
    const { batch, select } = selectBatch();
    batch.add(select);
    const items = JSON.parse(batch.serialize()).items;
    expect(items[0].__type).toBe(
      `${PlatformName.Terrasoft}.Nui.ServiceModel.DataContract.SelectQuery`,
    );
  });
  it('puts __type as the first key of an item', () => {
    const { batch, select } = selectBatch();
    batch.add(select);

    const items = JSON.parse(batch.serialize()).items;

    expect(Object.keys(items[0])[0]).toBe('__type');
  });

  it('does not send the client-side isBatchable flag', () => {
    const { batch, select } = selectBatch();
    batch.add(select);

    const items = JSON.parse(batch.serialize()).items;

    expect(items[0]).not.toHaveProperty('isBatchable');
    expect(JSON.parse(select.serialize())).not.toHaveProperty('isBatchable');
  });
  it('names the batch contents in the mismatch message', () => {
    const { batch, select } = selectBatch();
    batch.addNamed('contact', select);
    batch.addNamed('activities', new SelectQuery('Activity'));

    expect(() => batch.parseResponse(batchResponse([]))).toThrow(/contact, activities/);
  });

  it('reports the server error rather than the count mismatch', () => {
    const { batch, select } = selectBatch();
    batch.add(select);
    batch.add(new SelectQuery('Account'));
    const response = batchResponse([]);
    response.hasErrors = true;
    (response as { responseStatus?: { Message: string } }).responseStatus = {
      Message: 'Schema not found',
    };

    expect(() => batch.parseResponse(response)).toThrow(/Schema not found/);
  });

  it('returns the result of a named query', () => {
    const { batch, select } = selectBatch();
    batch.addNamed('contact', select);

    batch.parseResponse(batchResponse([{ CreatedOn: '2019-06-05T15:43:29.234' }]));

    const result = batch.getResult<SelectQueryResponse>('contact');
    expect(result?.rows[0]['CreatedOn']).toBeInstanceOf(Date);
  });

  it('keeps no result for an unnamed query', () => {
    const { batch, select } = selectBatch();
    batch.add(select);

    batch.parseResponse(batchResponse([{ CreatedOn: '2019-06-05T15:43:29.234' }]));

    expect(batch.getResult('contact')).toBeUndefined();
  });

  it('does not allow taking a name twice', () => {
    const { batch, select } = selectBatch();
    batch.addNamed('contact', select);

    expect(() => batch.addNamed('contact', new SelectQuery('Account'))).toThrow(
      /already in the batch/,
    );
  });
});

describe('BatchQuery: platform name', () => {
  it('does not create a batch without a platform name', () => {
    expect(() => new BatchQuery('' as PlatformName)).toThrow(/platformName/);
  });
});
