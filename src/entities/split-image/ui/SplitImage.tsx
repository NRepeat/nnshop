import { getLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

import { urlFor } from '@/shared/sanity/lib/image';
import { PAGE_QUERYResult } from '@/shared/sanity/types';
import { Button } from '@/shared/ui/button';
import { stegaClean } from 'next-sanity';
import { resolveLink } from '@/features/blocks/split-image/lib/resolveLink';

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
  console.log(link, 'link');
  const locale = await getLocale();
  const linkUrl = resolveLink(link?.[0]);

  const ImageComponent = image ? (
    <Image
      className="h-auto  rounded-none  w-full "
      src={urlFor(image).url()}
      width={800}
      height={600}
      alt=""
    />
  ) : null;

  return (
    <section
      className="container  flex gap-8 justify-between  data-[orientation='imageRight']:flex-row-reverse"
      data-orientation={stegaClean(orientation) || 'imageLeft'}
    >
      {linkUrl ? (
        <Link href={linkUrl} className="flex w-full max-w-2/3">
          {ImageComponent}
        </Link>
      ) : (
        ImageComponent
      )}
      <div className="flex items-center w-1/3 justify-center">
        <div className="flex flex-col items-center gap-4">
          {title ? (
            <h2 className="mx-auto max-w-3xl text-pretty text-center text-2xl font-light md:text-5xl lg:text-3xl">
              {title[locale as keyof typeof title]}
            </h2>
          ) : null}
          {linkUrl && (
            <Button asChild variant="link">
              <Link href={linkUrl}>{link?.[0]?.title}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
