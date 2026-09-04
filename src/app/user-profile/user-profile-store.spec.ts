import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BatchQuery, PlatformName, Query } from '@ep-crm/core';
import { PlatformHost, QueryExecutor, UserContextService } from '@ep-crm/devkit';
import { UserProfileData } from './user-profile-data.model';
import { UserProfileStore } from './user-profile-store';

const contactId: string = '11111111-1111-1111-1111-111111111111';

function batchResponse(): unknown {
  return {
    hasErrors: false,
    queryResults: [
      { rows: [{ Id: contactId, Name: 'John Smith', Email: 'i@example.com' }] },
      { rows: [{ ActivityCount: 7 }] },
      {
        rows: [
          { Id: 'a1', Title: 'Call' },
          { Id: 'a2', Title: 'Meeting' },
        ],
      },
    ],
  };
}

function configure(userContactId: string | null): {
  service: UserProfileStore;
  sent: Query<unknown>[];
} {
  const sent: Query<unknown>[] = [];
  TestBed.configureTestingModule({
    providers: [
      UserProfileStore,
      {
        provide: QueryExecutor,
        useValue: {
          executeQuery: (query: Query<unknown>) => {
            sent.push(query);
            query.parseResponse(batchResponse() as never);
            return of(batchResponse());
          },
        },
      },
      {
        provide: UserContextService,
        useValue: { userInfo: () => (userContactId ? { contactId: userContactId } : null) },
      },
      { provide: PlatformHost, useValue: { name: PlatformName.Terrasoft } },
    ],
  });
  return { service: TestBed.inject(UserProfileStore), sent };
}

describe('UserProfileStore', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('sends the card, the counter and the recent activities in one batch', () => {
    const { service, sent } = configure(contactId);

    service.load().subscribe();

    expect(sent.length).toBe(1);
    const batch = sent[0] as BatchQuery;
    expect(batch).toBeInstanceOf(BatchQuery);
    expect(batch.queries.length).toBe(3);
    expect(batch.serviceUrl).toBe('batch');
  });

  it('marks the batch items with the platform name', () => {
    const { service, sent } = configure(contactId);

    service.load().subscribe();

    const items = JSON.parse((sent[0] as BatchQuery).serialize())['items'] as { __type: string }[];
    expect(items.length).toBe(3);
    items.forEach((item) => expect(item.__type).toContain(PlatformName.Terrasoft));
    expect(items[0].__type).toContain('SelectQuery');
  });

  it('requests the contact, the activity counter and the activities themselves', () => {
    const { service, sent } = configure(contactId);

    service.load().subscribe();

    const items = JSON.parse((sent[0] as BatchQuery).serialize())['items'] as Record<
      string,
      unknown
    >[];
    expect(items[0]['rootSchemaName']).toBe('Contact');
    expect(items[1]['rootSchemaName']).toBe('Activity');
    expect(items[2]['rootSchemaName']).toBe('Activity');

    expect(items[2]['rowCount']).toBe(10);
  });

  it('spreads the batch response into its places', () => {
    const { service } = configure(contactId);
    let received: UserProfileData | null = null;

    service.load().subscribe((data) => (received = data));

    expect(received!.contact!['Name']).toBe('John Smith');
    expect(received!.activityCount).toBe(7);
    expect(received!.recentActivities.length).toBe(2);
  });

  it('sends no request when the user has no contact', () => {
    const { service, sent } = configure(null);
    let received: UserProfileData | null = null;

    service.load().subscribe((data) => (received = data));

    expect(sent.length).toBe(0);
    expect(received!.contact).toBeNull();
    expect(received!.activityCount).toBe(0);
  });

  it('opens and closes the dialog', () => {
    const { service } = configure(contactId);

    expect(service.opened()).toBe(false);
    service.open();
    expect(service.opened()).toBe(true);
    service.close();
    expect(service.opened()).toBe(false);
  });
});
