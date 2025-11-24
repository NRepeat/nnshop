export interface Order {
  id: string;
  name: string;
  lineItems: {
    edges: {
      node: {
        title: string;
        quantity: number;
        variant: {
          priceV2: {
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
}
