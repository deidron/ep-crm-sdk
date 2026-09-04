import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, defer, Observable, Subscription, tap, throwError } from 'rxjs';
import { BaseFilterableQuery, Query, QueryOperationType } from '@ep-crm/core';
import { BaseResponse } from '@ep-crm/core';
import { InvalidQueryResponseException } from '@ep-crm/core';
import { PlatformName } from '@ep-crm/core';
import { InvalidResponseException } from './invalid-response.exception';
import { PlatformUrlProvider } from '@ep-crm/core';
import { PlatformHost } from './platform-host';

const collisionControlPlatforms: ReadonlySet<PlatformName> = new Set([PlatformName.BPMSoft]);

const collisionControlOperations: ReadonlySet<QueryOperationType> = new Set([
  QueryOperationType.UPDATE,
  QueryOperationType.DELETE,
]);

@Service()
export class QueryExecutor {
  private readonly http = inject(HttpClient);
  private readonly urlProvider = inject(PlatformUrlProvider);
  private readonly host = inject(PlatformHost);

  execute<T>(
    query: Query<T>,
    callback?: (response: T) => void,
    errorCallback?: (error: Error) => void,
  ): Subscription {
    return this.executeQuery<T>(query, callback).subscribe({
      error: (error: Error) => {
        if (errorCallback) {
          errorCallback(error);
          return;
        }
        console.error(`Query "${query.serviceUrl}" failed:`, error);
      },
    });
  }

  executeQuery<T>(query: Query<T>, callback?: (response: T) => void): Observable<T> {
    return defer(() => {
      const jsonData: string = query.serialize();
      const url: string = this.urlProvider.resolve(query.serviceUrl);

      return this.api<T>(url, jsonData, this.collisionControlHeaders(query)).pipe(
        catchError((error) => throwError(() => new InvalidResponseException(error))),
      );
    }).pipe(
      tap((response) => {
        this.checkResponse(query, response);
        query.parseResponse(response, callback);
      }),
    );
  }

  private checkResponse<T>(query: Query<T>, response: T): void {
    const baseResponse: BaseResponse = response as unknown as BaseResponse;
    if (baseResponse?.success === false) {
      throw new InvalidQueryResponseException(query, baseResponse);
    }
  }

  private collisionControlHeaders<T>(query: Query<T>): Record<string, string> {
    const platformName: PlatformName | null = this.host.name;
    if (platformName === null || !collisionControlPlatforms.has(platformName)) {
      return {};
    }
    if (!(query instanceof BaseFilterableQuery)) {
      return {};
    }
    if (!collisionControlOperations.has(query.operationType)) {
      return {};
    }
    return query.hasEnabledPrimaryColumnFilter() ? { 'X-Client-Type': 'web' } : {};
  }

  private api<T>(url: string, data: string, headers: Record<string, string>): Observable<T> {
    return this.http.post<T>(url, data, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }
}
