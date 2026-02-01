import { HOME_PAGEResult } from '@/shared/sanity/types';
import { stegaClean } from 'next-sanity';

type FeaturesProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'features' }
> & { locale: string };

export function Features({ features, title }: FeaturesProps) {
  const isSingleItem = features?.length === 1;

  return (
    <section className=" mx-auto px-4 py-16 md:py-24">
      {title && (
        <h2 className="mb-16 text-center text-3xl font-light tracking-tight text-slate-900 md:text-5xl">
          {stegaClean(title as unknown as string)}
        </h2>
      )}

      {Array.isArray(features) && (
        <div
          className={`flex flex-wrap gap-y-12 justify-center ${
            isSingleItem ? 'max-w-2xl mx-auto' : 'md:grid md:grid-cols-3'
          } md:gap-x-12 lg:gap-x-20`}
        >
          {features.map((feature) => (
            <div
              key={feature._key}
              className={`group flex flex-col gap-5 ${
                isSingleItem
                  ? 'text-center items-center'
                  : 'text-start items-start'
              }`}
            >
              {feature.title && (
                <h3 className="text-lg font-medium uppercase tracking-widest text-slate-800 md:text-xl">
                  {stegaClean(feature.title as unknown as string)}
                </h3>
              )}

              {/* Линия: центрируется, если объект один */}
              <div
                className={`h-[1px] w-10 bg-slate-300 transition-all duration-300 group-hover:w-20 group-hover:bg-black ${
                  isSingleItem ? 'mx-auto' : ''
                }`}
              />

              {feature.text && (
                <p className="text-pretty text-base leading-relaxed text-slate-600 md:text-lg">
                  {stegaClean(feature.text as unknown as string)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
