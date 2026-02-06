import { Link } from '@shared/i18n/navigation';
import Image from 'next/image';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';

type MainCollectionGridProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'mainCollectionGrid' }
> & { locale: string };

export const MainCollectionGrid = (props: MainCollectionGridProps) => {
  const { collections, title, locale } = props;

  if (!collections) return null;

  const resolvedCollections = collections.map((collection) => {
    const pathData = resolveCollectionLink(collection, locale);
    return {
      ...collection,
      ...pathData,
      href: pathData?.handle ?? '#',
    };
  });
  console.log(collections,"resolvedCollections")
  return (
    <div className="main-collection-grid flex flex-col container">
      <div className="gap-12 flex flex-col py-8">
        {title && (
          <p className="pl-4 l pt-4 max-w-4xl text-pretty font-light leading-tight tracking-tight text-left text-lg md:text-3xl">
            {title as any as string}
          </p>
        )}

        <div className="flex flex-col gap-5 md:grid md:grid-cols-3 items-center">
          {resolvedCollections.map((col) => (
            <div key={col.handle ?? col.id} className='w-full'>
              <Link href={col.href} prefetch>
                <div className="flex flex-col relative group w-[370px] aspect-3/4 md:w-full group">
                  {col.image && col.image.url && (
                    <Image
                      src={col.image.url}
                      alt={col.title ?? ''}
                      className="object-contain w-full transition-transform duration-700 ease-in-out h-[375px] md:h-[450px] lg:h-[530px] max-h-[530px] group-hover:scale-105"
                      fill
                    />
                  )}
                  <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-20 group-hover:scale-105 transition-transform duration-700 ease-in-out"></div>
                  <h3 className="absolute bottom-5 left-5 text-background text-2xl font-sans font-400">
                    {col.title}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
