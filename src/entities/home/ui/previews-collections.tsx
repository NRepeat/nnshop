import { getCollection } from '@entities/collection/api/getCollection';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { SyncedCarousels } from './SyncedCarousels';

export type PreviewsCollectionsProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'collectionsWithPreviews' }
> & { locale: string; buttonText?: string };

export const PreviewsCollections = async (props: PreviewsCollectionsProps) => {
  console.log(props);
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
  return (
    <SyncedCarousels
      collectionsData={collectionsData}
      previews={previews}
      title={title}
    />
  );
};
