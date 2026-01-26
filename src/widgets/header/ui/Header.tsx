import { AnnouncementBar } from '@entities/announcement-bar/announcement-bar';
import Navigation, {
  CurrentNavigationSession,
  CurrentNavigationSessionSkilet,
} from '@features/header/navigation/ui/Navigation';
import { HeaderContent } from '@features/header/ui/HeaderContent';
import { HeaderContentSkeleton } from '@features/header/ui/HeaderContentSkeleton';
import { sanityFetch } from '@shared/sanity/lib/client';
import { urlFor } from '@shared/sanity/lib/image';
import { HEADER_QUERY } from '@shared/sanity/lib/query';
import { HEADER_QUERYResult } from '@shared/sanity/types';
import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { Suspense } from 'react';

export type HeaderBarProps = Extract<
  NonNullable<HEADER_QUERYResult>['header'],
  { _type: 'header' }
> & { locale: string };

export const Header = async ({
  locale,
  gender,
}: {
  locale: string;
  gender?: string;
}) => {
  const headerData = await sanityFetch({
    query: HEADER_QUERY,
    revalidate: 10,
    params: { locale },
    tags: ['siteSettings'],
  });
  setRequestLocale(locale);
  return (
    <>
      <Suspense fallback={<></>}>
        {headerData?.infoBar && headerData?.header && (
          <AnnouncementBar
            locale={locale}
            icon={headerData?.header?.icon}
            categories={{ locale, ...headerData?.header }}
            {...headerData?.infoBar}
          />
        )}
      </Suspense>

      <header className="sticky top-0  z-30  bg-background   md:h-fit flex flex-col items-center">
        <Suspense fallback={<HeaderContentSkeleton />}>
          {headerData?.header && (
            <HeaderContent
              locale={locale}
              {...headerData?.header}
              childern={
                <Link href="/" className="flex items-center justify-center">
                  <div className="flex justify-center w-full items-center">
                    {headerData?.header.icon?.asset && (
                      <Image
                        src={urlFor(headerData?.header.icon?.asset).url()}
                        width={304}
                        height={24}
                        alt="MioMio"
                        className="w-full h-full max-w-[180px]"
                      />
                    )}
                  </div>
                </Link>
              }
            ></HeaderContent>
          )}
        </Suspense>

        {gender ? (
          <div className="hidden md:block container">
            <Navigation locale={locale} gender={gender} />
          </div>
        ) : (
          <div className="hidden md:block container">
            <Suspense fallback={<CurrentNavigationSessionSkilet />}>
              <CurrentNavigationSession />
            </Suspense>
          </div>
        )}
      </header>
    </>
  );
};
