import { getCollection } from '@entities/collection/api/getCollection';
import { getLocalizedString } from '@shared/sanity/utils/getLocalizedString';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { SyncedCarousels } from './SyncedCarousels';

export type PreviewsCollectionsProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'collectionsWithPreviews' }
> & { locale: string; buttonText?: string };

export const PreviewsCollections = async (props: PreviewsCollectionsProps) => {
  const { collections, previews, locale, title } = props;

  const collectionsDataReq = collections
    ?.map((col) => {
      const collectionHandle = col.handle;
      if (collectionHandle) {
        return getCollection({
          handle: collectionHandle,
          first: 12,
          locale,
        });
      }
    })
    .filter(Boolean);
  if (!collectionsDataReq) return null;
  const collectionsData = await Promise.all(collectionsDataReq);
  // title can be a string (from coalesce), an array, or a localized object
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
    />
  );
};
