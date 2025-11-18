// Cart types based on Shopify Storefront API
export interface CartInput {
  attributes?: AttributeInput[];
  lines?: CartLineInput[];
  discountCodes?: string[];
  giftCardCodes?: string[];
  note?: string;
  buyerIdentity?: CartBuyerIdentityInput;
  delivery?: CartDeliveryInput;
  metafields?: CartInputMetafieldInput[];
}

export interface AttributeInput {
  key: string;
  value: string;
}

export interface CartLineInput {
  attributes?: AttributeInput[];
  quantity: number;
  merchandiseId: string;
  sellingPlanId?: string;
  parent?: CartLineParentInput;
}

export interface CartLineParentInput {
  id: string;
}

export interface CartBuyerIdentityInput {
  email?: string;
  phone?: string;
  companyLocationId?: string;
  countryCode?: string;
  customerAccessToken?: string;
  preferences?: CartPreferencesInput;
}

export interface CartPreferencesInput {
  [key: string]: any;
}

export interface CartDeliveryInput {
  addresses?: CartSelectableAddressInput[];
}

export interface CartSelectableAddressInput {
  deliveryAddress: CartDeliveryAddressInput;
}

export interface CartDeliveryAddressInput {
  address1?: string;
  address2?: string;
  city?: string;
  company?: string;
  country?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  province?: string;
  zip?: string;
}

export interface CartInputMetafieldInput {
  key: string;
  value: string;
  type: string;
}

// Response types
export interface CartCreatePayload {
  cart?: Cart;
  userErrors: CartUserError[];
  warnings: CartWarning[];
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLineConnection;
  cost: CartCost;
  note?: string;
  attributes: CartAttribute[];
  discountCodes: CartDiscountCode[];
  buyerIdentity: CartBuyerIdentity;
  createdAt: string;
  updatedAt: string;
}

export interface CartLineConnection {
  edges: CartLineEdge[];
}

export interface CartLineEdge {
  node: CartLine;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: CartLineMerchandise;
  cost: CartLineCost;
  attributes: CartAttribute[];
}

export interface CartLineMerchandise {
  id: string;
  title: string;
  image?: CartImage;
  product: CartProduct;
  selectedOptions: CartSelectedOption[];
}

// Merchandise type - currently only ProductVariant in Shopify Storefront API
export type Merchandise = ProductVariantMerchandise;

export interface ProductVariantMerchandise {
  id: string;
  title: string;
  image?: CartImage;
  product: CartProduct;
  selectedOptions: CartSelectedOption[];
}

export interface CartImage {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface CartProduct {
  id: string;
  title: string;
  handle: string;
}

export interface CartSelectedOption {
  name: string;
  value: string;
}

export interface CartLineCost {
  totalAmount: CartMoney;
  amountPerQuantity: CartMoney;
  compareAtAmountPerQuantity?: CartMoney;
}

export interface CartCost {
  totalAmount: CartMoney;
  subtotalAmount: CartMoney;
  totalTaxAmount?: CartMoney;
  totalDutyAmount?: CartMoney;
}

export interface CartMoney {
  amount: string;
  currencyCode: string;
}

export interface CartAttribute {
  key: string;
  value: string;
}

export interface CartDiscountCode {
  code: string;
  applicable: boolean;
}

export interface CartBuyerIdentity {
  email?: string;
  phone?: string;
  countryCode?: string;
  customer?: CartCustomer;
  deliveryAddressPreferences?: MailingAddress[];
}

export interface MailingAddress {
  address1?: string;
  address2?: string;
  city?: string;
  company?: string;
  country?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  province?: string;
  zip?: string;
}

export interface CartCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
}

export interface CartUserError {
  field?: string[];
  message: string;
}

export interface CartWarning {
  message: string;
}

// Simplified types for easier usage
export interface CreateCartInput {
  merchandiseId: string;
  quantity?: number;
  attributes?: Record<string, string>;
  note?: string;
  buyerIdentity?: {
    email?: string;
    phone?: string;
    countryCode?: string;
  };
}

export interface CreateCartResult {
  success: boolean;
  cart?: Cart;
  errors?: string[];
  warnings?: string[];
}

// Helper function to get cart lines as a simple array
export function getCartLines(cart: Cart): CartLine[] {
  return cart.lines.edges.map((edge) => edge.node);
}

// Helper function to get total items in cart
export function getCartItemCount(cart: Cart): number {
  return cart.lines.edges.reduce(
    (total, edge) => total + edge.node.quantity,
    0,
  );
}

// Type guard to check if merchandise is ProductVariant
export function isProductVariant(
  merchandise: Merchandise,
): merchandise is ProductVariantMerchandise {
  return 'product' in merchandise && 'selectedOptions' in merchandise;
}
