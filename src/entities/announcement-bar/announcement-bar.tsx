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
import { DEFAULT_GENDER } from '@shared/config/shop';
import { TELEGRAM_URL } from '@shared/config/brand';
import { ViberIcon } from '@widgets/footer/ui/Footer';

type AnnouncementBarProps = Extract<
  NonNullable<HEADER_QUERYResult>['infoBar'],
  { _type: 'infoBar' }
> & {
  locale: string;
  icon: HeaderBarProps['icon'];
  categories: HeaderBarProps | null | undefined;
};

export const AnnouncementBar = async (props: AnnouncementBarProps) => {
  const { telephone, link, locale, text, viberPhone } = props;
  const resolvedViberPhone =
    viberPhone || process.env.VIBER_PHONE_NUMBER || null;
  const viberUrl = resolvedViberPhone
    ? `viber://chat?number=%2B${resolvedViberPhone}`
    : null;
  const cookieStore = await cookies();
  const gender = cookieStore.get('gender')?.value || DEFAULT_GENDER;
  const collectionData = link?.collectionData;
  let resolvedLink = '';
  if (collectionData?.id) {
    const resolved = resolveCollectionLink(collectionData, locale, gender);
    resolvedLink = resolved?.handle || '';
  } else {
    resolvedLink = link?.collectionData?.pageHandle || '';
  }
  const displayText = typeof text === 'string' ? text : '';
  return (
    <>
      <div className="w-full bg-foreground py-0.5">
        <div className="w-full  justify-center bg-foreground text-background grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 container ">
          <div className="px-2 md:px-5 items-center  gap-2 w-full justify-start  flex h-full ">
            <a
              href={`tel:${telephone}`}
              className="text-nowrap"
              aria-label={`Call ${telephone}`}
            >
              {telephone}
            </a>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
            >
              <Button variant={'default'} className="bg-foreground" asChild>
                <span>
                  <Send className="max-w-[16px]" />
                </span>
              </Button>
            </a>
            {viberUrl && (
              <a
                href={viberUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Viber"
              >
                <Button variant={'default'} className="bg-foreground" asChild>
                  <span>
                    <ViberIcon />
                  </span>
                </Button>
              </a>
            )}
          </div>
          <Suspense>
            {displayText && (
              <Link
                href={resolvedLink}
                className="hidden sm:block"
                aria-label={displayText}
              >
                <p className=" w-full items-center justify-center py-3 font-400 hidden md:flex  ">
                  {displayText}
                </p>
                <p className=" w-full items-center justify-center py-3  font-400 flex md:hidden">
                  {displayText}
                </p>
              </Link>
            )}
          </Suspense>

          <div className="flex justify-end col-start-2 sm:col-start-3">
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
