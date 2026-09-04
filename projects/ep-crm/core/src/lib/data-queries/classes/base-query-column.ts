import { SerializedObject } from '../../serialization/serialized-object';
import { ArgumentOutOfRangeException } from '../../exceptions/argument.exception';
import { BaseSerializableObject } from '../../serialization/base-serializable-object';
import { OrderDirection } from '../enums/order-direction';
import { BaseExpression } from './base-expression';

export class BaseQueryColumn extends BaseSerializableObject {
  caption: string = '';

  orderDirection: OrderDirection = OrderDirection.NONE;

  orderPosition: number = -1;

  expression: BaseExpression | undefined;

  isVisible: boolean = true;

  constructor(expression?: BaseExpression) {
    super();
    this.expression = expression;
  }

  withOrdering(orderDirection: OrderDirection, orderPosition: number = 0): this {
    if (orderPosition < -1) {
      throw new ArgumentOutOfRangeException('orderPosition');
    }
    this.orderDirection = orderDirection;
    this.orderPosition = orderPosition;
    return this;
  }

  withCaption(caption: string): this {
    this.caption = caption;
    return this;
  }

  withOptions(options: { isVisible?: boolean }): this {
    this.isVisible = options.isVisible ?? true;
    return this;
  }

  protected prepareSerializableObject(serializableObject: SerializedObject): SerializedObject {
    serializableObject['orderDirection'] = this.orderDirection;
    serializableObject['orderPosition'] = this.orderPosition;
    serializableObject['isVisible'] = this.isVisible;
    serializableObject['expression'] = this.getSerializableProperty(this.expression ?? null);
    if (this.caption !== '') {
      serializableObject['caption'] = this.caption;
    }
    return serializableObject;
  }
}
