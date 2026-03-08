'use server';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { cacheLife, cacheTag } from 'next/cache';

const QUERY = `
  query GetVariantInventory($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        inventoryItem {
          inventoryLevels(first: 10) {
            edges {
              node {
                location { name }
                quantities(names: ["available","committed"]) {
                  name
                  quantity
                  
                }
              }
            }
          }
        }
      }
    }
  }
`;

export type VariantInventory = {
  variantId: string;
  available: number;
  committed: number;
  locations: { name: string; available: number; committed: number }[];
};

export async function getInventoryLevels(
  variantIds: string[],
): Promise<VariantInventory[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('inventory');
  if (!variantIds.length) return [];

  try {
    const data = await adminClient.client.request<any, any>({
      query: QUERY,
      variables: { ids: variantIds },
    });

    return (data?.nodes ?? [])
      .filter(Boolean)
      .map((node: any) => {
        const levels = node.inventoryItem?.inventoryLevels?.edges ?? [];
        const locations = levels.map((e: any) => ({
          name: e.node.location.name,
          available:
            e.node.quantities.find((q: any) => q.name === 'available')
              ?.quantity ?? 0,
          committed:
            e.node.quantities.find((q: any) => q.name === 'committed')
              ?.quantity ?? 0,
        }));
        return {
          variantId: node.id,
          available: locations.reduce(
            (sum: number, l: { available: number }) => sum + l.available,
            0,
          ),
          committed: locations.reduce(
            (sum: number, l: { committed: number }) => sum + l.committed,
            0,
          ),
          locations,
        };
      });
  } catch (e) {
    console.error('getInventoryLevels error:', e);
    return [];
  }
}
