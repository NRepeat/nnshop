import Link from 'next/link';
import Image from 'next/image';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { resolveShopifyLink } from '@shared/lib/shopify/resolve-shopify-link';
import { getLocale } from 'next-intl/server';

type MainCollectionGridProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'mainCollectionGrid' }
>;

export const MainCollectionGrid = async (props: MainCollectionGridProps) => {
  const { collections, title } = props;

  if (!collections) return null;

  const locale = await getLocale();
  const resolvedCollections = await Promise.all(
    collections.map(async (collection) => {
      const id = collection._ref.split('-')[1];
      const pathData = await resolveShopifyLink('collection', id, locale);
      console.log(pathData, id);
      return {
        ...collection,
        ...pathData,
        href: pathData?.handle ? `/collections/${pathData.handle}` : '#',
      };
    }),
  );
  return (
    <div className="main-collection-grid flex flex-col container">
      <div className="gap-12 flex flex-col py-8">
        {title && <p className="pl-4 font-400 text-xl">{title}</p>}

        <div className="flex flex-col gap-5 md:grid md:grid-cols-3">
          {resolvedCollections.map((col) => (
            <Link href={col.href} key={col._key}>
              <div className="flex flex-col relative group ">
                {col.image && col.image.url && (
                  <Image
                    src={col.image.url}
                    alt={col.title ?? ''}
                    className="object-cover w-full h-[400px] max-h-[598px]"
                    width={375}
                    height={598}
                  />
                )}
                <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-50"></div>
                <h3 className="absolute bottom-5 left-5 text-background text-2xl  font-sans font-400 ">
                  {col.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
