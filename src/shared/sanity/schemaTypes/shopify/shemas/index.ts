import collection from './documents/collection';
import collectionGroup from './objects/collection/group';
import heroCollection from './objects/hero/collection';
import moduleCallout from './objects/module/callout';
import moduleImage from './objects/module/image';
import moduleInstagram from './objects/module/instagram';
import proxyString from './objects/shopify/proxyString';
import shopifyCollection from './objects/shopify/shopifyCollection';
import shopifyCollectionRule from './objects/shopify/shopifyCollectionRule';
import linkInternal from './objects/global/linkInternal';
import linkExternal from './objects/global/linkExternal';
import { callToAction } from '@/shared/sanity/schemaTypes/shopify/shemas/objects/module/sopifyCallToAction';
import imageCallToAction from './objects/module/imageCallToAction';

const objects = [
  linkInternal,
  linkExternal,
  heroCollection,
  moduleCallout,
  moduleImage,
  moduleInstagram,
  proxyString,
  shopifyCollection,
  shopifyCollectionRule,
  collectionGroup,
  imageCallToAction,
  callToAction,
];

const documents = [collection];

export const shopifySchemaTypes = [...objects, ...documents];
