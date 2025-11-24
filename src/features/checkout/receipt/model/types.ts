import { Order } from '@entities/order/model/types';
import { Cart } from '@shared/lib/shopify/types/storefront.types';

export type OrderLine = Order['lineItems']['edges'][0];
export type CartLine = Cart['lines']['edges'][0];

export type Line = OrderLine | CartLine;
