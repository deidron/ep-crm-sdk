import { SerializedObject } from '../../serialization/serialized-object';
import { ArgumentNullOrEmptyException } from '../../exceptions/argument.exception';
import { BaseQuery } from './base-query';
import { BaseResponse } from '../../http/contracts/base-response';
import { BaseSerializableObject } from '../../serialization/base-serializable-object';
import { Query } from '../../http/contracts/query';
import { QueryOperationType } from '../enums/query-operation-type';
import { BatchQueryResponse } from '../interfaces/batch-query-response';
import { dataContractOf } from '../data-contract';
import { PlatformName } from '../../types/platform-name';

export class BatchQuery extends BaseSerializableObject implements Query<BatchQueryResponse> {
  operationType: QueryOperationType = QueryOperationType.BATCH;

  queries: [BaseQuery<BaseResponse>, ((result: BaseResponse) => void) | undefined][] = [];

  private readonly names: (string | undefined)[] = [];

  private readonly results = new Map<string, BaseResponse>();

  serviceUrl: string = 'batch';

  constructor(private readonly platformName: PlatformName) {
    super();
    if (!platformName) {
      throw new ArgumentNullOrEmptyException('platformName');
    }
  }

  add<T extends BaseResponse>(query: BaseQuery<T>, callback?: (result: T) => void) {
    if (!query) {
      throw new ArgumentNullOrEmptyException('query');
    }
    this.queries.push([query, callback as ((result: BaseResponse) => void) | undefined]);
    this.names.push(undefined);
  }

  addNamed<T extends BaseResponse>(
    name: string,
    query: BaseQuery<T>,
    callback?: (result: T) => void,
  ) {
    if (!name) {
      throw new ArgumentNullOrEmptyException('name');
    }
    if (this.names.includes(name)) {
      throw new Error(`A query named "${name}" is already in the batch.`);
    }
    this.add(query, callback);
    this.names[this.queries.length - 1] = name;
  }

  getResult<T extends BaseResponse>(name: string): T | undefined {
    return this.results.get(name) as T | undefined;
  }

  parseResponse(
    response: BatchQueryResponse,
    callback?: (response: BatchQueryResponse) => void,
  ): void {
    if (!response) {
      return;
    }
    this.checkResults(response);
    if (typeof callback !== 'undefined') {
      callback(response);
    }
    const queryResults: object[] = response.queryResults;
    this.results.clear();
    this.queries.forEach(([query, queryCallback], index) => {
      const queryResult: BaseResponse = queryResults[index] as BaseResponse;

      query.parseResponse(queryResult, queryCallback);
      const name: string | undefined = this.names[index];
      if (name) {
        this.results.set(name, queryResult);
      }
    });
  }

  protected prepareSerializableObject(serializableObject: SerializedObject): SerializedObject {
    serializableObject['items'] = this.queries.map(([query]) => ({
      __type: `${dataContractOf(this.platformName)}.${query.dtoTypeName}`,
      ...this.getSerializableProperty(query),
    }));
    return serializableObject;
  }

  private checkResults(response: BatchQueryResponse): void {
    if (response.hasErrors) {
      throw new Error(
        `The batch completed with errors: ${response.responseStatus?.Message ?? 'the service reported no reason'}.`,
      );
    }
    const received: number = response.queryResults?.length ?? 0;
    if (received !== this.queries.length) {
      throw new Error(
        `The batch sent ${this.queries.length} queries (${this.describeQueries()}), ` +
          `while the server returned ${received} results. ` +
          `The likely cause is a wrong platform name: "${this.platformName}".`,
      );
    }
  }

  private describeQueries(): string {
    return this.queries.map(([query], index) => this.names[index] ?? query.dtoTypeName).join(', ');
  }
}
