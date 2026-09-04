import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { QueryExecutor } from '../query-executor';
import { RunProcessRequest } from '@ep-crm/core';
import { RunProcessOptions } from '@ep-crm/core';
import { RunProcessResponse } from '@ep-crm/core';

@Service()
export class BusinessProcessService {
  private readonly executor = inject(QueryExecutor);

  runProcess(schemaName: string): Observable<RunProcessResponse> {
    return this.run({ schemaName });
  }

  run(options: RunProcessOptions): Observable<RunProcessResponse> {
    return this.executor.executeQuery<RunProcessResponse>(new RunProcessRequest(options));
  }
}
