export enum SchemaOperationRightLevel {
  NONE = 0,
  CAN_READ = 1,
  CAN_APPEND = 2,
  CAN_EDIT = 4,
  CAN_DELETE = 8,
}

export const ALL_SCHEMA_OPERATION_RIGHTS: number =
  SchemaOperationRightLevel.CAN_READ |
  SchemaOperationRightLevel.CAN_APPEND |
  SchemaOperationRightLevel.CAN_EDIT |
  SchemaOperationRightLevel.CAN_DELETE;
