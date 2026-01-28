import { AnnouncementBar } from '@entities/announcement-bar/announcement-bar';
import Navigation, {
  CurrentNavigationSession,
  CurrentNavigationSessionSkilet,
} from '@features/header/navigation/ui/Navigation';
import { HeaderContent } from '@features/header/ui/HeaderContent';
import { HeaderContentSkeleton } from '@features/header/ui/HeaderContentSkeleton';
import { LogoLink } from '@features/header/ui/LogoLink';
import { sanityFetch } from '@shared/sanity/lib/client';
import { urlFor } from '@shared/sanity/lib/image';
import { HEADER_QUERY } from '@shared/sanity/lib/query';
import { HEADER_QUERYResult } from '@shared/sanity/types';
import { setRequestLocale } from 'next-intl/server';
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
                headerData?.header.icon?.asset && (
                  <LogoLink
                    iconUrl={urlFor(headerData?.header.icon?.asset).url()}
                    alt="MioMio"
                  />
                )
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
