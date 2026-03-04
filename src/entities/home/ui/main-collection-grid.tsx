import { Link } from '@shared/i18n/navigation';
import Image from 'next/image';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';

type MainCollectionGridProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'mainCollectionGrid' }
> & { locale: string; gender?: string };

export const MainCollectionGrid = (props: MainCollectionGridProps) => {
  const { collections, title, locale, gender } = props;

  if (!collections) return null;

  const resolvedCollections = collections.map((collection) => {
    const pathData = resolveCollectionLink(collection, locale, gender);
    return {
      ...collection,
      ...pathData,
      href: pathData?.handle ?? '#',
    };
  });
  console.log(JSON.stringify(resolvedCollections, null, 2),'resolvedCollections');
  return (
    <div className="main-collection-grid flex flex-col container">
      <div className="gap-12 flex flex-col py-8">
        {title && (
          <p className="pl-4 l pt-4 max-w-4xl text-pretty font-light leading-tight tracking-tight text-left text-lg md:text-3xl">
            {title as any as string}
          </p>
        )}

        <div className="flex flex-col gap-5 md:grid md:grid-cols-3">
          {resolvedCollections.map((col) => (
            <div key={col.handle ?? col.id} className="w-full   ">
              <Link href={col.href} prefetch className="block w-full">
                <div className="relative group w-full aspect-3/4 rounded overflow-hidden">
                  {col.image && col.image.url && (
                    <Image
                      src={col.image.url}
                      alt={col.title ?? ''}
                      className="rounded object-cover w-full transition-transform duration-700 ease-in-out  group-hover:scale-105 group-hover:shadow transition-shadow"
                      fill
                      sizes="(max-width: 640px) 370px, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 rounded inset-shadow-sm " />
                  <div className=" absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-20 group-hover:scale-105 transition-transform duration-700 ease-in-out"></div>
                  <h3 className="absolute bottom-5 left-5 text-background text-3xl md:text-4xl font-sans font-400">
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
