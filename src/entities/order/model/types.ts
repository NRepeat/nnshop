interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  name: string;
  processedAt: string;
  displayFulfillmentStatus: string;
  email: string;
  shippingAddress: Address;
  billingAddress: Address;
  lineItems: {
    edges: {
      node: {
        title: string;
        quantity: number;
        variant: {
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
        };
        image: {
          url: string;
        };
      };
    }[];
  };
  subtotalPriceSet: {
    presentmentMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  totalShippingPriceSet: {
    presentmentMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  totalTaxSet: {
    presentmentMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  totalPriceSet: {
    presentmentMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  discountApplications?: {
    edges: {
      node: {
        value:
          | {
              __typename: 'MoneyV2';
              amount: string;
              currencyCode: string;
            }
          | {
              __typename: 'PricingPercentageValue';
              percentage: number;
            };
        code?: string;
        title?: string;
      };
    }[];
  };
}
