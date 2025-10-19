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

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    pageType,
    pageBuilderType,
    faqType,
    faqsType,
    featuresType,
    heroType,
    splitImageType,
  ],
};
