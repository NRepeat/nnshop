import Link from 'next/link';
import Image from 'next/image';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { resolveShopifyLink } from '@shared/lib/shopify/resolve-shopify-link';

type MainCollectionGridProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'mainCollectionGrid' }
> & { locale: string };

export const MainCollectionGrid = async (props: MainCollectionGridProps) => {
  const { collections, title, locale } = props;

  if (!collections) return null;

  const resolvedCollections = await Promise.all(
    collections.map(async (collection) => {
      const id = collection.id;
      if (!id) return null;
      const pathData = await resolveShopifyLink('collection', id, locale);
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
        {title && (
          <p className="pl-4 font-400 text-xl pt-4 max-w-4xl">
            {title as any as string}
          </p>
        )}

        <div className="flex flex-col gap-5 md:grid md:grid-cols-3 items-center">
          {resolvedCollections.map((col) => (
            <>
              {col && (
                <Link href={col?.href} key={col?.id}>
                  <div className="flex flex-col relative group w-[370px] md:w-full ">
                    {col?.image && col?.image.url && (
                      <Image
                        src={col?.image.url}
                        alt={col?.title ?? ''}
                        className="object-cover w-full   h-[375px] md:h-[450px] lg:h-[530px] max-h-[530px]"
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
              )}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};
