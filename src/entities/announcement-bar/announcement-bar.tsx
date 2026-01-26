import { LanguageSwitcherSession } from '@features/header/language-switcher/ui/LanguageSwitcherSession';
import { Button } from '@shared/ui/button';
import { Send } from 'lucide-react';
import { Link } from '@shared/i18n/navigation';
import { HEADER_QUERYResult } from '@/shared/sanity/types';
import { resolveShopifyLink } from '@shared/lib/shopify/resolve-shopify-link';
import { HeaderBarProps } from '@widgets/header/ui/Header';
import { Suspense } from 'react';

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
                  className="h-full w-12 animate-pulse bg-gray-200 dark:bg-gray-700"
                />
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
