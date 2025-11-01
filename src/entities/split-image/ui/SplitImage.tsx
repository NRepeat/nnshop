import { getLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

import { resolveLink } from '@/features/blocks/split-image/lib/resolveLink';
import { urlFor } from '@/shared/sanity/lib/image';
import { PAGE_QUERYResult } from '@/shared/sanity/types';
import { Button } from '@/shared/ui/button';
import { stegaClean } from 'next-sanity';

type SplitImageProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>['content']>[number],
  { _type: 'splitImage' }
>;

export async function SplitImage({
  title,
  image,
  orientation,
  link,
}: SplitImageProps) {
  const locale = await getLocale();
  const linkUrl = resolveLink(link?.[0]);

  const ImageComponent = image ? (
    <Image
      className="h-auto w-full rounded-none"
      src={urlFor(image).width(800).height(600).url()}
      width={800}
      height={600}
      alt=""
    />
  ) : null;

  const TextContent = ({ mobile = false }) => (
    <div
      className={`flex flex-col items-center gap-4 ${mobile ? 'text-white' : ''}`}
    >
      {title ? (
        <h2
          className={`mx-auto max-w-3xl text-pretty text-center font-light ${
            mobile ? 'text-4xl' : 'text-2xl md:text-5xl lg:text-3xl'
          }`}
        >
          {title[locale as keyof typeof title]}
        </h2>
      ) : null}
      {linkUrl && (
        <Button asChild variant="link" className={mobile ? 'text-white' : ''}>
          <Link href={linkUrl}>{link?.[0]?.title}</Link>
        </Button>
      )}
    </div>
  );

  return (
    <section
      className="container flex flex-col gap-8 py-16 md:flex-row data-[orientation='imageRight']:md:flex-row-reverse"
      data-orientation={stegaClean(orientation) || 'imageLeft'}
    >
      <div className="relative w-full md:w-2/3">
        {linkUrl ? (
          <Link href={linkUrl}>{ImageComponent}</Link>
        ) : (
          ImageComponent
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 md:hidden">
          <TextContent mobile />
        </div>
      </div>
      <div className="hidden w-1/3 items-center justify-center md:flex">
        <TextContent />
      </div>
    </section>
  );
}
