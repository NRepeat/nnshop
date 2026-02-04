import { LanguageSwitcherSession } from '@features/header/language-switcher/ui/LanguageSwitcherSession';
import { Button } from '@shared/ui/button';
import { Send } from 'lucide-react';
import { HEADER_QUERYResult } from '@/shared/sanity/types';
import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';
import { HeaderBarProps } from '@widgets/header/ui/Header';
import { Suspense } from 'react';
import Link from 'next/link';
import { parseLocale } from '@features/header/language-switcher/ui/LanguageSwitcher';

type AnnouncementBarProps = Extract<
  NonNullable<HEADER_QUERYResult>['infoBar'],
  { _type: 'infoBar' }
> & {
  locale: string;
  icon: HeaderBarProps['icon'];
  categories: HeaderBarProps | null | undefined;
};

export const AnnouncementBar = (props: AnnouncementBarProps) => {
  const { telephone, link, locale, text } = props;
  const collectionData = link?.collectionData;
  let resolvedLink = '';
  if (collectionData?.id) {
    const resolved = resolveCollectionLink(collectionData, locale);
    resolvedLink = resolved?.handle || '';
  } else {
    resolvedLink = link?.collectionData?.pageHandle || '';
  }
  return (
    <>
      <div className="w-full bg-foreground py-0.5">
        <div className="w-full  justify-center bg-foreground text-background grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 container ">
          <div className="px-2 md:px-5 items-center  gap-2 w-full justify-start  flex h-full ">
            <span className="text-nowrap">{telephone}</span>
            <Button variant={'default'} className="bg-foreground">
              <Send className="max-w-[16px]" />
            </Button>
          </div>
          <Suspense>
            <Link href={resolvedLink} className="hidden sm:block">
              <p className=" w-full items-center justify-center py-3 font-400 hidden md:flex  ">
                {text as any as string}
              </p>
              <p className=" w-full items-center justify-center py-3  font-400 flex md:hidden">
                {text as any as string}
              </p>
            </Link>
          </Suspense>

          <div className="flex justify-end">
            <Suspense
              fallback={
                <Button
                  variant="default"
                  className="h-full border-b-2 border-foreground bg-foreground hover:border-b-2 hover:border-b-[#e31e24] transition-colors"
                >
                  {parseLocale[locale as keyof typeof parseLocale]}
                  <span className="sr-only">Switch language</span>
                </Button>
              }
            >
              <LanguageSwitcherSession className="flex" locale={locale} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
};
