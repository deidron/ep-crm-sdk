import { SerializableObject } from '../../serialization/serializable-object';

export interface Query<T> extends SerializableObject {
  serviceUrl: string;

  parseResponse(response: T, callback?: (response: T) => void): void;

  serialize(): string;
}
