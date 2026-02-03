import body from './blocks/body';
import collection from './documents/collection';
import product from './documents/product';
import productVariant from './documents/productVariant';
import footer from './objects/global/footer';
import notFoundPage from './objects/global/notFoundPage';
import imageWithProductHotspots from './objects/hotspot/imageWithProductHotspots';
import productHotspots from './objects/hotspot/productHotspots';
import spot from './objects/hotspot/spot';
import accordionBody from './objects/module/accordionBody';
import accordionGroup from './objects/module/accordionGroup';
import seo from './objects/seo/shopifySeo';
import inventory from './objects/shopify/inventory';
import option from './objects/shopify/option';
import placeholderString from './objects/shopify/placeholderString';
import priceRange from './objects/shopify/priceRange';
import productWithVariant from './objects/shopify/productWithVariant';
import proxyString from './objects/shopify/proxyString';
import shopifyCollection from './objects/shopify/shopifyCollection';
import shopifyCollectionRule from './objects/shopify/shopifyCollectionRule';
import shopifyProduct from './objects/shopify/shopifyProduct';
import shopifyProductVariant from './objects/shopify/shopifyProductVariant';
import heroCollection from './objects/hero/collection';
import heroPage from './objects/hero/page';
import moduleAccordion from './objects/module/accordion';
import moduleCollection from './objects/module/collection';
import moduleGrid from './objects/module/grid';
import moduleImage from './objects/module/image';
import moduleImages from './objects/module/images';
import moduleInstagram from './objects/module/instagram';
import moduleProduct from './objects/module/product';
import moduleProducts from './objects/module/products';
import customProductOptionColor from './objects/customProductOption/color';
import customProductOptionColorObject from './objects/customProductOption/colorObject';
import customProductOptionSize from './objects/customProductOption/size';
import customProductOptionSizeObject from './objects/customProductOption/sizeObject';
import collectionGroup from './objects/collection/group';
import gridItem from './objects/module/gridItem';
import imageCallToAction from './objects/module/imageCallToAction';
import moduleCallout from './objects/module/callout';

import shopifLinkEmail from './annotations/shopifLinkEmail';
import shopifLinkExternal from './annotations/shopifLinkExternal';
import shopifLinkInternal from './annotations/shopifLinkInternal';
import productAnnotation from './annotations/product';
import { callToAction } from '@/shared/sanity/schemaTypes/shopify/shemas/objects/module/sopifyCallToAction';
import linkInternal from './objects/global/linkInternal';
import linkExternal from './objects/global/linkExternal';

const annotations = [
  shopifLinkEmail,
  shopifLinkExternal,
  shopifLinkInternal,
  productAnnotation,
];

const objects = [
  linkInternal,
  linkExternal,
  customProductOptionColor,
  customProductOptionColorObject,
  customProductOptionSize,
  customProductOptionSizeObject,
  footer,
  imageWithProductHotspots,
  inventory,
  notFoundPage,
  heroCollection,
  heroPage,
  moduleAccordion,
  accordionBody,
  accordionGroup,
  moduleCollection,
  moduleGrid,
  moduleImage,
  moduleImages,
  moduleInstagram,
  moduleProduct,
  moduleProducts,
  placeholderString,
  priceRange,
  spot,
  productWithVariant,
  productHotspots,
  option,
  proxyString,
  shopifyCollection,
  shopifyCollectionRule,
  shopifyProduct,
  shopifyProductVariant,
  collectionGroup,
  gridItem,
  imageCallToAction,
  moduleCallout,
  callToAction,
  seo,
];
const blocks = [body];
const documents = [collection, product, productVariant];

export const shopifySchemaTypes = [
  ...annotations,
  ...objects,
  ...blocks,
  ...documents,
];
