import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { urlFor } from '@/shared/sanity/lib/image';
import { HOME_PAGEResult } from '@/shared/sanity/types';
import { Button } from '@/shared/ui/button';
import { stegaClean } from 'next-sanity';
import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';

type SplitGridProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'splitImage' }
> & { locale: string; gender?: string };

const TextContentComponent = ({
  title,
  linkUrl,
  description,
  mobile = false,
}: {
  title: string | null;
  linkUrl: {
    title?: string | null;
    handle?: string | null;
    image?: { url?: string | null } | null;
  } | null;
  description?: string | null;
  mobile?: boolean;
}) => (
  <div
    className={`flex flex-col gap-6 w-full ${
      mobile ? 'items-center text-white px-6' : 'items-start text-black'
    }`}
  >
    {title ? (
      <h2
        className={`text-pretty font-light leading-tight tracking-tight ${
          mobile
            ? 'text-center text-3xl sm:text-4xl'
            : 'text-left text-3xl md:text-4xl lg:text-5xl'
        }`}
      >
        {title as unknown as string}
      </h2>
    ) : null}

    {linkUrl && linkUrl?.handle && (
      <Button
        variant="link"
        className={`h-auto p-0 text-base uppercase tracking-widest group-hover:underline  duration-300 decoration-transparent group-hover:decoration-primary  transition-all group-hover:opacity-70 ${
          mobile ? 'text-white  border-white' : 'text-black  border-black'
        } rounded-md`}
      >
        {description || linkUrl?.title}
      </Button>
    )}
  </div>
);

export function SplitImage(props: SplitGridProps) {
  const { title, image, orientation, collection, locale, gender } = props;
  const description = (props as any).description;
  const localizedDescription = description
    ? (description[locale as 'uk' | 'ru'] ?? description.uk ?? null)
    : null;
  const linkUrl =
    collection && collection?.id
      ? resolveCollectionLink(collection, locale, gender)
      : null;
  const ImageComponent = image ? (
    <div className="group relative w-full h-full aspect-square overflow-hidden rounded bg-gray-100 ">
      <Image
        className="transition-transform duration-700 ease-in-out group-hover:scale-105"
        src={urlFor(image).width(1500).height(1500).url()}
        fill
        alt={(title as unknown as string) || ''}
        priority
      />

      <div className="pointer-events-none absolute inset-0 rounded inset-shadow-sm " />
    </div>
  ) : null;
  return (
    <section className="container group">
      <div className="py-8 md:py-8">
        <Link
          href={linkUrl && linkUrl.handle ? linkUrl.handle : ''}
          className="block h-full w-full group"
          prefetch
        >
          <div
            className="w-full flex flex-col gap-8 md:flex-row md:items-center  data-[orientation='imageRight']:md:flex-row-reverse"
            data-orientation={stegaClean(orientation) || 'imageLeft'}
          >
            <div className="relative aspect-square w-full overflow-hidden    md:w-[600px] max-h-[600px]">
              {ImageComponent}

              <div className="rounded absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] md:hidden">
                <TextContentComponent
                  mobile
                  title={title as string | null}
                  linkUrl={linkUrl}
                  description={localizedDescription}
                />
              </div>
            </div>

            <div className="hidden w-full md:flex md:w-1/3 md:pl-12 data-[orientation='imageRight']:md:pl-0 data-[orientation='imageRight']:md:pr-12">
              <TextContentComponent
                title={title as string | null}
                linkUrl={linkUrl}
                description={localizedDescription}
              />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
