import { LinkExternal, LinkInternal } from '@/shared/sanity/types';

export function resolveLink(
  link: LinkInternal | LinkExternal | undefined | null,
): string | undefined {
  if (!link) {
    return undefined;
  }

  if (link._type === 'linkExternal') {
    return link.url;
  }

  if (link._type === 'linkInternal' && link.reference) {
    const { _type, slug } = link.reference as any;
    switch (_type) {
      case 'product':
        return `/product/${slug}`;
      case 'collection':
        return `/collection/${slug}`;
      case 'page':
        return `/${slug}`;
      default:
        return undefined;
    }
  }

  return undefined;
}
