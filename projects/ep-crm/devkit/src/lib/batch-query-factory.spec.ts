import { TestBed } from '@angular/core/testing';
import { BatchQuery, PlatformName, SelectQuery } from '@ep-crm/core';
import { BatchQueryFactory } from './batch-query-factory';
import { PlatformHost } from './platform-host';

function configure(platformName: PlatformName | null): BatchQueryFactory {
  TestBed.configureTestingModule({
    providers: [BatchQueryFactory, { provide: PlatformHost, useValue: { name: platformName } }],
  });
  return TestBed.inject(BatchQueryFactory);
}

describe('BatchQueryFactory', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('marks the batch items with the platform name', () => {
    const batch: BatchQuery = configure(PlatformName.BPMSoft).create();
    batch.add(new SelectQuery('Contact'));

    const items = JSON.parse(batch.serialize())['items'] as { __type: string }[];

    expect(items[0].__type).toBe(
      `${PlatformName.BPMSoft}.Nui.ServiceModel.DataContract.SelectQuery`,
    );
  });

  it('takes the platform name from the environment rather than from a default', () => {
    const batch: BatchQuery = configure(PlatformName.Terrasoft).create();
    batch.add(new SelectQuery('Contact'));

    const items = JSON.parse(batch.serialize())['items'] as { __type: string }[];

    expect(items[0].__type).toBe(
      `${PlatformName.Terrasoft}.Nui.ServiceModel.DataContract.SelectQuery`,
    );
  });

  it('refuses to assemble a batch when the platform name is unknown', () => {
    const factory: BatchQueryFactory = configure(null);

    expect(() => factory.create()).toThrow(/platform name/);
  });

  it('returns a separate batch on every call', () => {
    const factory: BatchQueryFactory = configure(PlatformName.BPMSoft);

    const first: BatchQuery = factory.create();
    first.add(new SelectQuery('Contact'));

    expect(factory.create().queries.length).toBe(0);
  });
});
