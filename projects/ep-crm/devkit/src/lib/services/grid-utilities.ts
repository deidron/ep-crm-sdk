import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { QueryExecutor } from '../query-executor';
import { DeleteRecordsRequest } from '@ep-crm/core';
import { DeleteRecordsPayload, DeleteRecordsResponse } from '@ep-crm/core';

@Service()
export class GridUtilitiesService {
  private readonly executor = inject(QueryExecutor);

  deleteRecords(payload: DeleteRecordsPayload): Observable<DeleteRecordsResponse> {
    return this.executor.executeQuery<DeleteRecordsResponse>(new DeleteRecordsRequest(payload));
  }
}
