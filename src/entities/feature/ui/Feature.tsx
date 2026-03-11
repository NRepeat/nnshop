import { HOME_PAGEResult } from '@/shared/sanity/types';
import { getLocalizedString } from '@shared/sanity/utils/getLocalizedString';

type FeaturesProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'features' }
> & { locale: string };

export function Features({ features, locale }: FeaturesProps) {
  const isSingleItem = features?.length === 1;

  return (
    <section className="container ">
      <div className="py-8 md:py-24">
        {Array.isArray(features) && (
          <div
            className={`flex flex-wrap gap-y-12 justify-center ${
              isSingleItem ? 'max-w-6xl mx-auto' : 'md:grid md:grid-cols-3'
            } md:gap-x-12 lg:gap-x-20`}
          >
            {features.map((feature) => {
              const featureTitle = getLocalizedString(feature.title as any, locale);
              const featureText = getLocalizedString(feature.text as any, locale);
              return (
                <div
                  key={feature._key}
                  className={`group flex flex-col gap-5 ${
                    isSingleItem
                      ? 'text-center items-center'
                      : 'text-start items-start'
                  }`}
                >
                  {featureTitle && (
                    <h3 className="text-2xl font-medium uppercase tracking-widest text-slate-800 md:text-3xl">
                      {featureTitle}
                    </h3>
                  )}

                  {/* Линия: центрируется, если объект один */}
                  <div
                    className={`h-[1px] w-10 bg-slate-300 transition-all duration-300 group-hover:w-20 group-hover:bg-black ${
                      isSingleItem ? 'mx-auto' : ''
                    }`}
                  />

                  {featureText && (
                    <p className="text-pretty text-base leading-relaxed text-slate-600 md:text-2xl max-w-3xl">
                      {featureText}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
