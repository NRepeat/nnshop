import { LanguageSwitcherSession } from '@features/header/language-switcher/ui/LanguageSwitcherSession';
import { Button } from '@shared/ui/button';
import { Send } from 'lucide-react';
import { HEADER_QUERYResult } from '@/shared/sanity/types';
import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';
import { HeaderBarProps } from '@widgets/header/ui/Header';
import { Suspense } from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { parseLocale } from '@features/header/language-switcher/ui/LanguageSwitcher';

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
  const cookieStore = await cookies();
  const gender = cookieStore.get('gender')?.value || 'woman';
  const collectionData = link?.collectionData;
  let resolvedLink = '';
  if (collectionData?.id) {
    const resolved = resolveCollectionLink(collectionData, locale, gender);
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
            <a href="https://t.me/miomio_com_ua" target="_blank" rel="noopener noreferrer">
              <Button variant={'default'} className="bg-foreground" asChild>
                <span><Send className="max-w-[16px]" /></span>
              </Button>
            </a>
            <a href="viber://chat?number=%2B380XXXXXXXXX" target="_blank" rel="noopener noreferrer">
              <Button variant={'default'} className="bg-foreground" asChild>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="currentColor" className="max-w-[16px] h-4 w-4">
                    <path d="M33.451 28.854c-1.111-.936-1.624-1.219-3.158-2.14C29.654 26.331 28.68 26 28.169 26c-.349 0-.767.267-1.023.523C26.49 27.179 26.275 28 25.125 28c-1.125 0-3.09-1.145-4.5-2.625C19.145 23.965 18 22 18 20.875c0-1.15.806-1.38 1.462-2.037C19.718 18.583 20 18.165 20 17.816c0-.511-.331-1.47-.714-2.109-.921-1.535-1.203-2.048-2.14-3.158-.317-.376-.678-.548-1.056-.549-.639-.001-1.478.316-2.046.739-.854.637-1.747 1.504-1.986 2.584-.032.147-.051.295-.057.443-.046 1.125.396 2.267.873 3.234 1.123 2.279 2.609 4.485 4.226 6.455.517.63 1.08 1.216 1.663 1.782.566.582 1.152 1.145 1.782 1.663 1.97 1.617 4.176 3.103 6.455 4.226.958.472 2.086.906 3.2.874.159-.005.318-.023.477-.058 1.08-.238 1.947-1.132 2.584-1.986.423-.568.74-1.406.739-2.046C33.999 29.532 33.827 29.171 33.451 28.854zM34 24c-.552 0-1-.448-1-1v-1c0-4.962-4.038-9-9-9-.552 0-1-.448-1-1s.448-1 1-1c6.065 0 11 4.935 11 11v1C35 23.552 34.552 24 34 24zM27.858 22c-.444 0-.85-.298-.967-.748-.274-1.051-1.094-1.872-2.141-2.142-.535-.139-.856-.684-.718-1.219.138-.534.682-.855 1.219-.718 1.748.453 3.118 1.822 3.575 3.574.139.535-.181 1.08-.715 1.22C28.026 21.989 27.941 22 27.858 22z"/>
                    <path d="M31,23c-0.552,0-1-0.448-1-1c0-3.188-2.494-5.818-5.678-5.986c-0.552-0.029-0.975-0.5-0.946-1.051 c0.029-0.552,0.508-0.976,1.051-0.946C28.674,14.241,32,17.748,32,22C32,22.552,31.552,23,31,23z"/>
                    <path d="M24,4C19.5,4,12.488,4.414,8.216,8.316C5.196,11.323,4,15.541,4,21c0,0.452-0.002,0.956,0.002,1.5 C3.998,23.043,4,23.547,4,23.999c0,5.459,1.196,9.677,4.216,12.684c1.626,1.485,3.654,2.462,5.784,3.106v4.586 C14,45.971,15.049,46,15.241,46h0.009c0.494-0.002,0.921-0.244,1.349-0.624c0.161-0.143,2.02-2.215,4.042-4.481 C21.845,40.972,22.989,41,23.999,41c4.5,0,11.511-0.415,15.784-4.317c3.019-3.006,4.216-7.225,4.216-12.684 c0-0.452,0.002-0.956-0.002-1.5c0.004-0.544,0.002-1.047,0.002-1.5c0-5.459-1.196-9.677-4.216-12.684C35.511,4.414,28.5,4,24,4z M41,23.651l0,0.348c0,4.906-1.045,8.249-3.286,10.512C33.832,38,26.437,38,23.999,38c-0.742,0-1.946-0.001-3.367-0.1 C20.237,38.344,16,43.083,16,43.083V37.22c-2.104-0.505-4.183-1.333-5.714-2.708C8.045,32.248,7,28.905,7,23.999l0-0.348 c0-0.351-0.001-0.73,0.002-1.173C6.999,22.078,6.999,21.7,7,21.348L7,21c0-4.906,1.045-8.249,3.286-10.512 C14.167,6.999,21.563,6.999,24,6.999c2.437,0,9.832,0,13.713,3.489c2.242,2.263,3.286,5.606,3.286,10.512l0,0.348 c0,0.351,0.001,0.73-0.002,1.173C41,22.922,41,23.3,41,23.651z"/>
                  </svg>
                </span>
              </Button>
            </a>
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
                  className="h-full border-b-2 border-foreground bg-foreground hover:border-b-2 hover:border-b-foreground transition-colors"
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
