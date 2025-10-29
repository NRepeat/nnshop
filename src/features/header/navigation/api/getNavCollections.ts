import { storefrontClient } from '@shared/lib/shopify/client';

export const getNavCollections = async () => {
  const query = `
    query {
      collections(first: 10) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `;

  const responce = (await storefrontClient.request(query)) as {
    collections: {
      edges: {
        node: {
          id: string;
          title: string;
        };
      }[];
    };
  };

  const collections = responce.collections.edges.map((edge) => edge.node);
  return collections;
};
