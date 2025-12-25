import { type SchemaTypeDefinition } from 'sanity';

import { blockContentType } from './blockContentType';
import { categoryType } from './categoryType';
import { postType } from './postType';
import { authorType } from './authorType';
import { faqsType } from './blokcs/faqsType';
import { faqType } from './blokcs/faqType';
import { featuresType } from './blokcs/featuresType';
import { heroType } from './blokcs/heroType';
import { splitImageType } from './blokcs/splitImageType';
import { pageBuilderType } from './pageBuilderType';
import { pageType } from './pageType';
import { siteSettingsType } from './siteSettingsType';
import { seoType } from './seoType';
import { redirectType } from './redirectType';
import { socialType } from './socialType';
import { localeType } from './localeType';
import simpleBlockContent from './simpleBlockContent';
import { shopifySchemaTypes } from './shopify/shemas';
import { productCarousel } from './blokcs/productCarousel';
import { collectionsCarousel } from './blokcs/collectionsCarouselWithActionButton';
import { localizedString } from './localizedStringType';
import { localizedText } from './localizedText';
import { localizedBlockContent } from './localizedBlockContentType';
import { sliderBlock } from './blokcs/slider';
import { similarProducts } from './blokcs/similarProducts';
import { contentPageBlock } from './blokcs/contentPageBlock';
import { mainCollectionGrid } from './blokcs/mainCollectionGrid';
import { topicType } from './blokcs/topicType';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    ...shopifySchemaTypes,
    localizedText,
    localizedBlockContent,
    sliderBlock,
    collectionsCarousel,
    productCarousel,
    simpleBlockContent,
    localeType,
    localizedString,
    socialType,
    blockContentType,
    redirectType,
    categoryType,
    siteSettingsType,
    seoType,
    postType,
    authorType,
    pageType,
    pageBuilderType,
    faqType,
    faqsType,
    featuresType,
    heroType,
    splitImageType,
    similarProducts,
    contentPageBlock,
    mainCollectionGrid,
    topicType,
  ],
};
