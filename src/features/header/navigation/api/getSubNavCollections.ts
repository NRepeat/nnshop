import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { storefrontClient } from '@shared/lib/shopify/client';
import { getLocale, getTranslations } from 'next-intl/server';

const getSubNavCollections = async ({
  params,
}: {
  params: {
    slug: string;
  };
}) => {
  const t = await getTranslations('Header.subnav');
  const locale = await getLocale();
  const gender = params.slug;
  const collectionsTamplate = [
    { name: t('clothes.title'), href: '/clothes', slug: 'clothes' },
    { name: t('shoes.title'), href: '/shoes', slug: 'shoes' },
    { name: t('bags.title'), href: '/bags', slug: 'bags' },
    { name: t('accessories.title'), href: '/accessories', slug: 'accessories' },
  ];
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

  const responce = (await storefrontClient.request({
    query,
    language: locale.toUpperCase() as StorefrontLanguageCode,
  })) as {
    collections: {
      edges: {
        node: {
          id: string;
          title: string;
        };
      }[];
    };
  };

  return [];
};
