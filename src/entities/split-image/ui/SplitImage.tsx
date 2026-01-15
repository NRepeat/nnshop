import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/shared/sanity/lib/image';
import { HOME_PAGEResult } from '@/shared/sanity/types';
import { Button } from '@/shared/ui/button';
import { stegaClean } from 'next-sanity';
import { resolveShopifyLink } from '@shared/lib/shopify/resolve-shopify-link';

type SplitGridProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'splitImage' }
> & { locale: string };

export async function SplitImage(props: SplitGridProps) {
  const { title, image, orientation, collection, locale } = props;

  let linkUrl =
    collection && collection?.id
      ? await resolveShopifyLink('collection', collection?.id, locale)
      : null;
  const ImageComponent = image ? (
    <div className="group relative h-full w-full overflow-hidden bg-gray-100">
      <Image
        className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
        src={urlFor(image).width(1200).height(800).url()}
        width={1200}
        height={800}
        alt={(title as unknown as string) || ''}
        priority
      />
    </div>
  ) : null;

  const TextContent = ({ mobile = false }) => (
    <div
      className={`flex flex-col gap-6 ${
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
          asChild
          variant="link"
          className={`h-auto p-0 text-base uppercase tracking-widest transition-all hover:opacity-70 ${
            mobile ? 'text-white  border-white' : 'text-black  border-black'
          } rounded-none`}
        >
          <Link href={linkUrl.handle}>{linkUrl?.title}</Link>
        </Button>
      )}
    </div>
  );

  return (
    <section className=" px-4 py-8 md:py-24 mt-6">
      <div
        className="flex flex-col gap-8 md:flex-row md:items-center data-[orientation='imageRight']:md:flex-row-reverse"
        data-orientation={stegaClean(orientation) || 'imageLeft'}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-auto md:h-[600px] md:w-2/3">
          {linkUrl && linkUrl.handle ? (
            <Link href={linkUrl.handle} className="block h-full w-full">
              {ImageComponent}
            </Link>
          ) : (
            ImageComponent
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] md:hidden">
            <TextContent mobile />
          </div>
        </div>

        <div className="hidden w-full md:flex md:w-1/3 md:pl-12 data-[orientation='imageRight']:md:pl-0 data-[orientation='imageRight']:md:pr-12">
          <TextContent />
        </div>
      </div>
    </section>
  );
}
