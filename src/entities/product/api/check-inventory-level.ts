import { adminClient } from '@shared/lib/shopify/admin-client';
export const checkInventoryLevel = async (variantId: string) => {
  const CHECK_INVENTORY_QUERY = `
    query getVariantInventory($id: ID!) {
      productVariant(id: $id) {
        id
        title
        inventoryQuantity
        inventoryItem {
          tracked
        }
      }
    }
  `;

  try {
    const res = await adminClient.client.request<
      {
        productVariant: {
          id: string;
          title: string;
          inventoryQuantity: number;
          inventoryItem: { tracked: boolean; quantity: number };
        };
      },
      { id: string }
    >({
      query: CHECK_INVENTORY_QUERY,
      variables: { id: variantId },
    });

    const variant = res.productVariant;

    if (!variant) {
      console.warn(`Variant with id ${variantId} not found`);
      return null;
    }

    // Если Shopify не отслеживает количество для этого товара (tracked: false),
    // технически его "бесконечное" количество.
    if (!variant.inventoryItem.tracked) {
      return {
        quantity: Infinity,
        tracked: false,
      };
    }

    return {
      quantity: variant.inventoryQuantity,
      tracked: true,
    };
  } catch (err) {
    console.error('Error checking inventory level:', err);
    return null;
  }
};
