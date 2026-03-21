import React from 'react';
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@shared/ui/navigation-menu';
import { DEFAULT_GENDER, GENDERS } from '@shared/config/shop';
import { getCollectionImages } from '../api/getCollectionImages';
import { cookies, headers } from 'next/headers';
import { NavigationClient } from './NavigationClient';
import { Skeleton } from '@shared/ui/skeleton';
import { NavigationItemClient } from './NavigationItemClient';
import { NavigationTriggerClient } from './NavigationTriggerClient';
import { NavDropdownContent } from './NavDropdownContent';
import { NavigationContentLink } from './NavigationContentLink';
import { Button } from '@shared/ui/button';
import { getTranslations } from 'next-intl/server';
import { cleanSlug } from '@shared/lib/utils/cleanSlug';

type NavImage = {
  _key?: string | null;
  url?: string | null;
  menuIndex?: number | null;
  imageUrl?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  collectionHandle?: string | null;
  collectionTitle?: string | null;
  imageTitle?: string | null;
  imageButtonLabel?: string | null;
  imageButtonUrl?: string | null;
  imageButtonCollectionHandle?: string | null;
  brandSlug?: string | null;
};

type SanityColumnItem = {
  _id: string;
  title: string;
  handle: string;
  navTitleColor?: string | null;
} | null;

type SanityColumn = {
  title: string;
  url?: string | null;
  items?: SanityColumnItem[] | null;
  outletLink?: {
    label?: string | null;
    collectionHandle?: string | null;
    url?: string | null;
  } | null;
  actionButton?: {
    label?: string | null;
    collectionHandle?: string | null;
    url?: string | null;
  } | null;
};

type SanityDropdown = {
  _key: string;
  isBrandsTab?: boolean | null;
  tabTitle?: string | null;
  tabUrl?: string | null;
  topBrands?: Array<{ _id: string; title: string; handle: string }> | null;
  tabImage?: NavImage | null;
  columns?: SanityColumn[] | null;
};

type NavDropdowns = {
  woman?: SanityDropdown[] | null;
  man?: SanityDropdown[] | null;
} | null;

export const CurrentNavigationSession = async ({
  locale,
  gender,
  navDropdowns,
}: {
  locale: string;
  gender?: string;
  navDropdowns?: NavDropdowns;
}) => {
  const [cookie, headersList] = await Promise.all([cookies(), headers()]);
  const cookieGender = cookie.get('gender')?.value;
  const headerGender = headersList.get('x-gender');
  const currentGender =
    gender ||
    (headerGender && GENDERS.includes(headerGender as any)
      ? headerGender
      : null) ||
    (GENDERS.includes(cookieGender as any) ? cookieGender : null) ||
    DEFAULT_GENDER;
  return (
    <Navigation
      gender={currentGender}
      locale={locale}
      navDropdowns={navDropdowns}
    />
  );
};

export const CurrentNavigationSessionSkeleton = () => {
  const mainMenu = [
    { slug: 'home', title: 'Home' },
    { slug: 'about', title: 'About' },
    { slug: 'about', title: 'About' },
    { slug: 'about', title: 'About' },
  ];
  const menu = mainMenu.map((item, index) => {
    return (
      <NavigationMenuItem key={`${item.title}-${index}`} className="block">
        <Skeleton className="w-[100px] h-[30px]" />
      </NavigationMenuItem>
    );
  });
  return (
    <NavigationClient className="bg-transparent flex  justify-start p-2">
      {menu}
    </NavigationClient>
  );
};

const Navigation = async ({
  gender,
  locale,
  navDropdowns,
}: {
  gender: string;
  locale: string;
  navDropdowns?: NavDropdowns;
}) => {
  const t = await getTranslations({ locale, namespace: 'BrandsPage' });

  // Tabs come from Sanity navDropdowns, sorted by menuIndex
  const tabs = navDropdowns?.[gender as 'woman' | 'man'] ?? [];

  // Collect all child collection handles for prefetching featured images (only category tabs)
  const allChildHandles = [
    ...new Set(
      tabs.flatMap((tab) =>
        (tab.columns ?? []).flatMap((col) =>
          (col.items ?? [])
            .filter((item): item is NonNullable<SanityColumnItem> => item != null)
            .map((item) => item.handle),
        ),
      ),
    ),
  ];

  const collectionImages = await getCollectionImages(
    allChildHandles,
    locale,
  ).catch(() => ({}) as Record<string, string | null>);

  const withGender = (url: string) => {
    const stripped = cleanSlug(url);
    const path =
      stripped === `/${gender}` ? `/${gender}` : `/${gender}${stripped}`;
    return cleanSlug(path);
  };

  const seenUrls = new Set<string>();

  const menu = tabs.map((tab) => {
    const tabHref = tab.tabUrl
      ? tab.tabUrl.startsWith('/')
        ? tab.tabUrl
        : withGender(`/${tab.tabUrl}`)
      : `/${gender}`;
    const tabLabel = tab.tabTitle ?? '';
    // Brands tab
    if (tab.isBrandsTab) {
      return (
        <NavigationMenuItem key={`${tab._key}-${gender}`} className="group">
          <NavigationTriggerClient
            href={tabHref}
            className="hover:underline duration-300 decoration-transparent hover:decoration-primary transition-all font-light"
          >
            {tabLabel}
          </NavigationTriggerClient>
          <NavigationMenuContent className="px-4 w-full flex justify-center">
            <div className="flex gap-10 px-6 w-full py-8 justify-between max-w-6xl">
              <div className="flex-1 min-w-[180px] max-w-[260px]">
                <NavigationItemClient className="block mb-3 px-4">
                  <p className="text-base font-semibold tracking-wide border-b border-border pb-2">
                    {t('topBrands')}
                  </p>
                </NavigationItemClient>
                <ul className="flex flex-col gap-0.5">
                  {(tab.topBrands ?? []).slice(0, 5).map((brand) => (
                    <li
                      key={brand._id}
                      className="w-full group rounded hover:shadow hover:bg-secondary/50 transition-colors duration-200"
                    >
                      <NavigationItemClient
                        className="w-full rounded px-0"
                        href={withGender(`/${brand.handle}`)}
                      >
                        <Button
                          variant="ghost"
                          className="group-hover:underline duration-300 decoration-transparent hover:decoration-primary transition-all text-base font-normal font-sans w-full justify-start px-4 border-none min-h-10 rounded"
                        >
                          {brand.title}
                        </Button>
                      </NavigationItemClient>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 min-w-[180px] max-w-[260px]">
                <div className="block mb-3">
                  <p className="text-base font-semibold tracking-wide border-b border-border pb-2 invisible">
                    Spacer
                  </p>
                </div>
                <ul className="flex flex-col gap-0.5">
                  {(tab.topBrands ?? []).slice(5, 10).map((brand) => (
                    <li
                      key={brand._id}
                      className="w-full group rounded hover:shadow hover:bg-secondary/50 transition-colors duration-200"
                    >
                      <NavigationItemClient
                        className="w-full rounded px-0"
                        href={withGender(`/${brand.handle}`)}
                      >
                        <Button
                          variant="ghost"
                          className="group-hover:underline duration-300 decoration-transparent hover:decoration-primary transition-all text-base font-normal font-sans w-full justify-start px-4 border-none rounded"
                        >
                          {brand.title}
                        </Button>
                      </NavigationItemClient>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-border pt-3">
                  <NavigationItemClient href="/brands" className="px-0">
                    <span className="text-sm font-base hover:underline transition-all px-4">
                      {t('allBrands')} →
                    </span>
                  </NavigationItemClient>
                </div>
              </div>
              <div className="border-l border-muted pl-8 shrink-0">
                <div className="grid grid-cols-7 gap-x-2 gap-y-2">
                  {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                    <NavigationContentLink
                      key={letter}
                      href={`/brands#letter-${letter}`}
                      className="border-none rounded text-base font-base hover:shadow hover:bg-secondary/50 transition-colors duration-200 text-center w-9 h-9 flex items-center justify-center"
                    >
                      {letter}
                    </NavigationContentLink>
                  ))}
                  <NavigationContentLink
                    href="/brands"
                    className="border-none text-base font-base hover:shadow hover:bg-secondary/50 transition-colors duration-200 text-center rounded w-9 h-9 flex items-center justify-center"
                  >
                    #
                  </NavigationContentLink>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      );
    }

    // Category tab
    const navImage = tab.tabImage ?? null;

    const imageHref = navImage?.collectionHandle
      ? `/${gender}/${navImage.collectionHandle}`
      : navImage?.brandSlug
        ? `/brands/${navImage.brandSlug}`
        : (navImage?.url ?? '#');
    const imageButtonUrl = navImage?.imageButtonCollectionHandle
      ? `/${gender}/${navImage.imageButtonCollectionHandle}`
      : (navImage?.imageButtonUrl ?? null);
    const defaultImage = navImage?.imageUrl
      ? {
          imageUrl: navImage.imageUrl,
          imageWidth: navImage.imageWidth,
          imageHeight: navImage.imageHeight,
          href: imageHref,
          alt: navImage.collectionTitle ?? '',
          imageTitle: navImage.imageTitle ?? null,
          imageButtonLabel: navImage.imageButtonLabel ?? null,
          imageButtonUrl,
        }
      : null;

    const columns = (tab.columns ?? []).map((col) => {
      const colUrl = col.url ? withGender(`/${col.url}`) : null;
      return {
        title: col.title,
        url: colUrl,
        items: (col.items ?? [])
          .filter((item): item is NonNullable<SanityColumnItem> => item != null)
          .map((item) => {
            const itemUrl = withGender(`/${item.handle}`);
            const isDuplicate = seenUrls.has(itemUrl);
            seenUrls.add(itemUrl);
            return {
              title: item.title,
              url: itemUrl,
              isDuplicate,
              collectionImageUrl: collectionImages[item.handle] ?? null,
              navTitleColor: item.navTitleColor ?? null,
            };
          }),
        outletLink: col.outletLink?.label
          ? {
              label: col.outletLink.label,
              url: col.outletLink.collectionHandle
                ? withGender(`/${col.outletLink.collectionHandle}`)
                : (col.outletLink.url ?? '#'),
            }
          : null,
        actionButton: col.actionButton?.label
          ? {
              label: col.actionButton.label,
              url: col.actionButton.collectionHandle
                ? withGender(`/${col.actionButton.collectionHandle}`)
                : col.actionButton.url
                  ? col.actionButton.url
                  : col.url
                    ? withGender(`/${col.url}`)
                    : tabHref,
            }
          : null,
      };
    });

    return (
      <NavigationMenuItem key={`${tab._key}-${gender}`} className="group">
        <NavigationTriggerClient
          href={tabHref}
          className="hover:underline duration-300 decoration-transparent hover:decoration-primary transition-all font-light "
        >
          {tabLabel}
        </NavigationTriggerClient>
        <NavigationMenuContent className="px-4 w-full flex justify-center">
          <NavDropdownContent
            // @ts-ignore
            columns={columns}
            defaultImage={defaultImage}
            gender={gender}
          />
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  });

  return (
    <NavigationClient key={locale} className=" pt-2 w-full">
      {menu}
    </NavigationClient>
  );
};
export default Navigation;
