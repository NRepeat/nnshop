import linkExternal from './annotations/linkExternal';
import linkInternal from './annotations/linkInternal';
import body from './blocks/body';
import links from './objects/collection/links';
import footer from './objects/global/footer';
import menu from './objects/global/menu';
import notFoundPage from './objects/global/notFoundPage';
import imageWithProductHotspots from './objects/hotspot/imageWithProductHotspots';
import productHotspots from './objects/hotspot/productHotspots';
import spot from './objects/hotspot/spot';
import accordionBody from './objects/module/accordionBody';
import accordionGroup from './objects/module/accordionGroup';
import seo from './objects/seo/seo';
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
import collection from './documents/collection';
import colorTheme from './documents/colorTheme';
import page from './documents/page';
import product from './documents/product';
import productVariant from './documents/productVariant';
import heroCollection from './objects/hero/collection';
import heroHome from './objects/hero/home';
import heroPage from './objects/hero/page';
import moduleAccordion from './objects/module/accordion';
import moduleCallout from './objects/module/callout';
import moduleCallToAction from './objects/module/callToAction';
import moduleCollection from './objects/module/collection';
import moduleGrid from './objects/module/grid';
import gridItems from './objects/module/gridItem';
import moduleImage from './objects/module/image';
import moduleImageAction from './objects/module/imageCallToAction';
import moduleImages from './objects/module/images';
import moduleInstagram from './objects/module/instagram';
import moduleProduct from './objects/module/product';
import moduleProducts from './objects/module/products';
import annotationLinkEmail from './annotations/linkEmail';
import annotationLinkExternal from './annotations/linkExternal';
import annotationLinkInternal from './annotations/linkInternal';
import annotationProduct from './annotations/product';
import customProductOptionColor from './objects/customProductOption/color';
import customProductOptionColorObject from './objects/customProductOption/colorObject';
import customProductOptionSize from './objects/customProductOption/size';
import customProductOptionSizeObject from './objects/customProductOption/sizeObject';
const annotations = [
  annotationLinkEmail,
  annotationLinkExternal,
  annotationLinkInternal,
  annotationProduct,
];
import seoHome from './objects/seo/home';
import collectionGroup from './objects/collection/group';
import collectionLinks from './objects/collection/links';

import seoPage from './objects/seo/page';
import seoDescription from './objects/seo/description';
import seoShopify from './objects/seo/shopify';
const objects = [
  // customProductOptionColor,
  // customProductOptionColorObject,
  // customProductOptionSize,
  // customProductOptionSizeObject,
  // footer,
  // imageWithProductHotspots,
  // inventory,
  // links,
  // linkExternal,
  // linkInternal,
  // notFoundPage,
  // heroCollection,
  // heroHome,
  // heroPage,
  // moduleAccordion,
  // accordionBody,
  // accordionGroup,
  // menu,
  // moduleCallout,
  // moduleCallToAction,
  // moduleCollection,
  // moduleGrid,
  // gridItems,
  // moduleImage,
  // moduleImageAction,
  // moduleImages,
  // moduleInstagram,
  // moduleProduct,
  // moduleProducts,
  //
  // placeholderString,
  // priceRange,
  // spot,
  productHotspots,
  option,
  // productWithVariant,
  proxyString,
  // seo,
  // seoHome,
  // seoPage,
  // seoDescription,
  // seoShopify,
  // shopifyCollection,
  // shopifyCollectionRule,
  // shopifyProduct,
  // shopifyProductVariant,
  // collectionGroup,
  // collectionLinks,
];
const blocks = [body];
const documents = [collection, colorTheme, product, productVariant];

export const shopifySchemaTypes = [
  // ...annotations,
  // ...objects,
  // ...blocks,
  // ...documents,
  product,
  ...objects,
];
