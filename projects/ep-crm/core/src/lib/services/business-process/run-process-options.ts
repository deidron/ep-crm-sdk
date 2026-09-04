export interface ProcessParameterValue {
  name: string;
  value: unknown;
}

export interface RunProcessOptions {
  schemaName?: string;

  schemaUId?: string;
  parameterValues?: ProcessParameterValue[];

  resultParameterNames?: string[];

  collectExecutionData?: boolean;
}
