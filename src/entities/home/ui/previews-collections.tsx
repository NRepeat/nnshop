import { getCollection } from '@entities/collection/api/getCollection';
import { getLocalizedString } from '@shared/sanity/utils/getLocalizedString';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { SyncedCarousels } from './SyncedCarousels';

export type PreviewsCollectionsProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'collectionsWithPreviews' }
> & { locale: string; buttonText?: string; gender?: string };

export const PreviewsCollections = async (props: PreviewsCollectionsProps) => {
  const { collections, previews, locale, title, gender } = props;

  const items = collections as unknown as Array<{
    collection?: { store?: { slug?: { current?: string }; title?: string }; handles?: Record<string, string>; titles?: Record<string, string> };
    customTitle?: { uk?: string; ru?: string };
  }>;
  const collectionsDataReq = items
    ?.filter(Boolean)
    .map((col) => {
      const handle = col.collection?.store?.slug?.current;
      if (handle) {
        return getCollection({ handle, first: 12, locale });
      }
    })
    .filter(Boolean);
  if (!collectionsDataReq) return null;
  const collectionsData = await Promise.all(collectionsDataReq);
  const customTitles = items?.map((col) =>
    col.customTitle?.[locale as 'uk' | 'ru'] ?? col.customTitle?.uk ?? null
  ) ?? [];
  const localizedTitle = typeof title === 'string'
    ? title
    : Array.isArray(title)
      ? getLocalizedString(title[0], locale)
      : getLocalizedString(title, locale);
  return (
    <SyncedCarousels
      collectionsData={collectionsData}
      previews={previews}
      title={localizedTitle}
      customTitles={customTitles}
      gender={gender}
    />
  );
};
