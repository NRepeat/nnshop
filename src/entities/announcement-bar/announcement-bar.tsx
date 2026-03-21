import { LanguageSwitcherSession } from '@features/header/language-switcher/ui/LanguageSwitcherSession';
import { Button } from '@shared/ui/button';
import { Send } from 'lucide-react';
import { HEADER_QUERYResult } from '@/shared/sanity/types';
import { HeaderBarProps } from '@widgets/header/ui/Header';
import { Suspense } from 'react';
import { parseLocale } from '@features/header/language-switcher/ui/LanguageSwitcher';
import { TELEGRAM_CHANNEL_URL } from '@shared/config/brand';
import { ViberIcon } from '@widgets/footer/ui/Footer';
import { AnnouncementTicker } from './AnnouncementTicker';

type AnnouncementBarProps = Extract<
  NonNullable<HEADER_QUERYResult>['infoBar'],
  { _type: 'infoBar' }
> & {
  locale: string;
  icon: HeaderBarProps['icon'];
  categories: HeaderBarProps | null | undefined;
};

export const AnnouncementBar = async (props: AnnouncementBarProps) => {
  const { telephone, text, viberPhone, locale } = props;
  const resolvedViberPhone =
    viberPhone || process.env.VIBER_PHONE_NUMBER || null;
  const viberUrl = resolvedViberPhone
    ? `viber://chat?number=%2B${resolvedViberPhone}`
    : null;
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
              href={TELEGRAM_CHANNEL_URL}
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
              <AnnouncementTicker
                text={displayText}
                className="hidden sm:block overflow-hidden py-3"
              />
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
