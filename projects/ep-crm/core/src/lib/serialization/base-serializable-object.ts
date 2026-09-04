import { SerializableObject } from './serializable-object';
import { SerializedObject } from './serialized-object';

export abstract class BaseSerializableObject implements SerializableObject {
  serialize(): string {
    return JSON.stringify(this.getSerializableProperty(this));
  }

  protected getSerializableProperty(
    value: BaseSerializableObject | null | undefined,
  ): SerializedObject | undefined {
    return value ? value.prepareSerializableObject({}) : undefined;
  }

  protected abstract prepareSerializableObject(
    serializableObject: SerializedObject,
  ): SerializedObject;
}
