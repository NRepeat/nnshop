import { AnnouncementBar } from '@entities/announcement-bar/announcement-bar';
import {
  CurrentNavigationSession,
  CurrentNavigationSessionSkilet,
} from '@features/header/navigation/ui/Navigation';
import { HeaderContent } from '@features/header/ui/HeaderContent';
import { HeaderContentSkeleton } from '@features/header/ui/HeaderContentSkeleton';
import { HeaderOptions } from '@features/header/ui/HeaderOptions';
import { LogoLink } from '@features/header/ui/LogoLink';
import { PersistLinkNavigation } from '@features/header/navigation/ui/PersistLinkNavigation';
import { sanityFetch } from '@shared/sanity/lib/client';
import { urlFor } from '@shared/sanity/lib/image';
import { HEADER_QUERY } from '@shared/sanity/lib/query';
import { HEADER_QUERYResult } from '@shared/sanity/types';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export type HeaderBarProps = Extract<
  NonNullable<HEADER_QUERYResult>['header'],
  { _type: 'header' }
> & { locale: string };

export const Header = async ({ locale }: { locale: string }) => {
  const headerData = await sanityFetch({
    query: HEADER_QUERY,
    revalidate: 10,
    params: { locale },
    tags: ['siteSettings'],
  });
  setRequestLocale(locale);
  return (
    <>
      <Suspense
        fallback={
          <>
            <div className="w-full bg-foreground py-0.5 h-[50px]">
              <div className="w-full  justify-center bg-foreground text-background grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 container ">
                <div className="px-2 md:px-5 items-center  gap-2 w-full justify-start  flex h-full "></div>
              </div>
            </div>
          </>
        }
      >
        {headerData?.infoBar && headerData?.header && (
          <AnnouncementBar
            locale={locale}
            icon={headerData?.header?.icon}
            categories={{ locale, ...headerData?.header }}
            {...headerData?.infoBar}
          />
        )}
      </Suspense>

      <header className="sticky top-0 z-30 bg-background md:h-fit flex flex-col items-center">
        <div className="container w-full">
          <div className="w-full font-sans text-foreground grid grid-cols-3 text-base py-3">
            <Suspense fallback={<HeaderContentSkeleton />}>
              {headerData?.header && (
                <HeaderContent locale={locale} {...headerData?.header} />
              )}
            </Suspense>
            <div className="flex items-center justify-center">
              <Suspense
                fallback={
                  <Link href={'/'} className="flex items-center justify-center">
                    <div className="flex justify-center w-full items-center">
                      {headerData?.header?.icon?.asset && (
                        <Image
                          src={urlFor(headerData?.header.icon?.asset).url()}
                          width={304}
                          height={24}
                          alt={'logo'}
                          className="w-full h-full max-w-[180px]"
                        />
                      )}
                    </div>
                  </Link>
                }
              >
                {headerData?.header?.icon?.asset && (
                  <LogoLink
                    locale={locale}
                    iconUrl={urlFor(headerData?.header.icon?.asset).url()}
                    alt="MioMio"
                  />
                )}
              </Suspense>
            </div>

            <HeaderOptions locale={locale} />
          </div>
          {headerData?.header?.mainCategory && (
            <div className="justify-center w-full items-center flex md:hidden flex-row pb-1">
              <PersistLinkNavigation locale={locale} {...headerData?.header} />
            </div>
          )}
        </div>

        <div className="hidden md:block w-full">
          <Suspense fallback={<CurrentNavigationSessionSkilet />}>
            <CurrentNavigationSession locale={locale} />
          </Suspense>
        </div>
      </header>
    </>
  );
};
