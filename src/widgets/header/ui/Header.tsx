import { AnnouncementBar } from '@entities/announcement-bar/announcement-bar';
import Navigation from '@features/header/navigation/ui/Navigation';
import { HeaderContent } from '@features/header/ui/HeaderContent';
import { sanityFetch } from '@shared/sanity/lib/client';
import { HEADER_QUERY } from '@shared/sanity/lib/query';
import { HEADER_QUERYResult } from '@shared/sanity/types';

export type HeaderBarProps = Extract<
  NonNullable<HEADER_QUERYResult>['header'],
  { _type: 'header' }
> & { locale: string };

export const Header = async ({
  locale,
  gender,
}: {
  locale: string;
  gender: string;
}) => {
  const headerData = await sanityFetch({
    query: HEADER_QUERY,
    revalidate: 10,
    params: { locale },
    tags: ['siteSettings'],
  });
  return (
    <>
      {headerData?.infoBar && headerData?.header && (
        <AnnouncementBar
          locale={locale}
          icon={headerData?.header?.icon}
          categories={{ locale, ...headerData?.header }}
          {...headerData?.infoBar}
        />
      )}
      <header className="sticky top-0  z-30  bg-background   md:h-fit flex flex-col items-center">
        {headerData?.header && (
          <HeaderContent locale={locale} {...headerData?.header} />
        )}
        <div className="hidden md:block container">
          <Navigation locale={locale} gender={gender} />
        </div>
      </header>
    </>
  );
};
