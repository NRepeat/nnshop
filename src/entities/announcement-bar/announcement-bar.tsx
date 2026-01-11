import { LanguageSwitcherSession } from '@features/header/language-switcher/ui/LanguageSwitcherSession';
import { Button } from '@shared/ui/button';
import { Send } from 'lucide-react';
import Link from 'next/link';
import { HEADER_QUERYResult } from '@/shared/sanity/types';
import { resolveShopifyLink } from '@shared/lib/shopify/resolve-shopify-link';
import { HeaderBarProps } from '@widgets/header/ui/Header';

type AnnouncementBarProps = Extract<
  NonNullable<HEADER_QUERYResult>['infoBar'],
  { _type: 'infoBar' }
> & {
  locale: string;
  icon: HeaderBarProps['icon'];
  categories: HeaderBarProps | null | undefined;
};

export const AnnouncementBar = async (props: AnnouncementBarProps) => {
  const { telephone, link, locale, text } = props;
  const collectionData = link?.collectionData;
  let resolvedLink = '';
  if (collectionData?.id) {
    const resolvedLinks = await resolveShopifyLink(
      'collection',
      collectionData?.id,
      locale,
    );
    resolvedLink = resolvedLinks?.handle || '';
  } else {
    resolvedLink = link?.collectionData?.pageHandle || '';
  }
  return (
    <>
      <div className="w-full bg-foreground py-0.5">
        <div className="w-full  justify-center bg-foreground text-background grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 container ">
          <div className="px-2 md:px-5 items-center  gap-2 w-full justify-start  flex h-full ">
            <span className="text-nowrap">{telephone}</span>
            <Button variant={'default'}>
              <Send className="max-w-[16px]" />
            </Button>
          </div>
          <Link href={resolvedLink} className="hidden sm:block">
            <p className=" w-full items-center justify-center py-3 font-400 hidden md:flex  ">
              {text as any as string}
            </p>
            <p className=" w-full items-center justify-center py-3  font-400 flex md:hidden">
              {text as any as string}
            </p>
          </Link>
          <div className="flex justify-end">
            <LanguageSwitcherSession className="flex" />
          </div>
        </div>
      </div>
    </>
  );
};
