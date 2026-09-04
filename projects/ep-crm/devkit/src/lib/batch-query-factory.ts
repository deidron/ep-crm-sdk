import { inject, Service } from '@angular/core';
import { BatchQuery, PlatformName } from '@ep-crm/core';
import { PlatformHost } from './platform-host';

@Service()
export class BatchQueryFactory {
  private readonly host = inject(PlatformHost);

  create(): BatchQuery {
    const platformName: PlatformName | null = this.host.name;
    if (!platformName) {
      throw new Error(
        'The platform name is not set: a query batch cannot be assembled without it. ' +
          'Specify platformName in the application environment.',
      );
    }
    return new BatchQuery(platformName);
  }
}
