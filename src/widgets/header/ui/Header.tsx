import { AnnouncementBar } from '@entities/announcement-bar/announcement-bar';
import { AccountButton } from '@features/header/account/ui/AccoutnButton';
import CartSheet from '@features/header/cart/ui/Sheet';
import { LanguageSwitcherSession } from '@features/header/language-switcher/ui/LanguageSwitcherSession';
import Navigation, {
  CurrentNavigationSession,
  CurrentNavigationSessionSkilet,
} from '@features/header/navigation/ui/Navigation';
import { PersistLinkNavigation } from '@features/header/navigation/ui/PersistLinkNavigation';
import NavigationSheet from '@features/header/navigation/ui/Sheet';
import { SearchSession } from '@features/header/search/ui/search-session';
import { HeaderContent } from '@features/header/ui/HeaderContent';
import Logo from '@shared/assets/Logo';
import { sanityFetch } from '@shared/sanity/lib/client';
import { HEADER_QUERY } from '@shared/sanity/lib/query';
import { HEADER_QUERYResult } from '@shared/sanity/types';
import { Button } from '@shared/ui/button';
import { Heart, Menu, Search, Send, ShoppingCart, User2 } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import { defineQuery } from 'next-sanity';
import Link from 'next/link';
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
      <header className="sticky top-0  z-30  bg-background">
        {headerData?.header && (
          <HeaderContent locale={locale} {...headerData?.header} />
        )}
        <div className="hidden lg:block container">
          <Navigation locale={locale} gender={gender} />
        </div>
      </header>
    </>
  );
};
