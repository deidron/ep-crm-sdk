import { SerializedObject } from '../../serialization/serialized-object';
import { BaseSerializableObject } from '../../serialization/base-serializable-object';
import { Query } from '../../http/contracts/query';
import { RunProcessOptions } from './run-process-options';
import { RunProcessResponse } from './run-process-response';

export class RunProcessRequest extends BaseSerializableObject implements Query<RunProcessResponse> {
  serviceUrl: string = 'runProcess';

  constructor(private readonly options: RunProcessOptions) {
    super();
    if (!options.schemaName && !options.schemaUId) {
      throw new Error('Starting a process requires either schemaName or schemaUId.');
    }
  }

  parseResponse(
    response: RunProcessResponse,
    callback?: (response: RunProcessResponse) => void,
  ): void {
    if (typeof callback !== 'undefined') {
      callback(response);
    }
  }

  protected prepareSerializableObject(serializableObject: SerializedObject): SerializedObject {
    serializableObject['collectExecutionData'] = this.options.collectExecutionData ?? true;
    serializableObject['resultParameterNames'] = this.options.resultParameterNames ?? [];
    if (this.options.schemaName) {
      serializableObject['schemaName'] = this.options.schemaName;
    }
    if (this.options.schemaUId) {
      serializableObject['schemaUId'] = this.options.schemaUId;
    }
    if (this.options.parameterValues?.length) {
      serializableObject['parameterValues'] = this.options.parameterValues;
    }
    return serializableObject;
  }
}
