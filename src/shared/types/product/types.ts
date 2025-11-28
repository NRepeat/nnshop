import { GetProductByHandleQuery } from '@shared/lib/shopify/types/storefront.generated';

export type Product = GetProductByHandleQuery['product'];
