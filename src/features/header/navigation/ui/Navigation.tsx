import React from 'react';
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@shared/ui/navigation-menu';
import { getMainMenu } from '../api/getMainMenu';
import {getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { NavigationClient } from './NavigationClient';
import { Skeleton } from '@shared/ui/skeleton';
import { NavigationItemClient } from './NavigationItemClient';
import { NavigationTriggerClient } from './NavigationTriggerClient';
import { Button } from '@shared/ui/button';
import Link from 'next/link';
import { getAllBrands } from '@entities/brand/api/getAllBrands';
import { vendorToHandle } from '@shared/lib/utils/vendorToHandle';
import { HEADER_QUERYResult } from '@shared/sanity/types';
import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';

type BrandsNavigationData = NonNullable<HEADER_QUERYResult>['brandsNavigation'];

export const CurrentNavigationSession = async ({
  locale,
  brandsNavigation,
}: {
  locale: string;
  brandsNavigation?: BrandsNavigationData;
}) => {
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || 'woman';
  return <Navigation gender={gender} locale={locale} brandsNavigation={brandsNavigation} />;
};

export const CurrentNavigationSessionSkilet = () => {
  const meinMenu = [
    { slug: 'home', title: 'Home', items: [] },
    { slug: 'about', title: 'About', items: [] },
  ];
  const menu = meinMenu.map((item, index) => {
    return (
      <NavigationMenuItem
        key={item.title}
        className={` ${index === meinMenu.length - 1 ? 'block' : 'block'}`}
      >
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

const genderSlugMap: Record<string, string[]> = {
  woman: [
    'woman',
    'women',
    'female',
    'жен',
    'женщин',
    'жінк',
    'zhinok',
    'zhinoch',
  ],
  man: ['man', 'men', 'male', 'муж', 'мужчин', 'чолов', 'cholovik'],
};

function matchesGender(
  item: { url: string; title: string },
  gender: string,
): boolean {
  const slug = item.url.split('/').pop()?.toLowerCase() || '';
  const title = item.title.toLowerCase();
  const slugs = genderSlugMap[gender] || [];
  return slugs.some((s) => slug.includes(s) || title.includes(s));
}

const Navigation = async ({
  gender,
  locale,
  brandsNavigation,
}: {
  gender: string;
  locale: string;
  brandsNavigation?: BrandsNavigationData;
}) => {
  const allItems = await getMainMenu({ locale });
  const meinMenu = allItems.filter((item) => matchesGender(item, gender));
  console.log(meinMenu,"meinMenu",gender,locale)
  const t = await getTranslations({ locale, namespace: 'BrandsPage' });

  const items = meinMenu.length > 0 ? meinMenu : allItems.slice(0, 1);

  // Brands dropdown: use Sanity data if available, fallback to auto-detected
  const sanityTopBrands = brandsNavigation?.topBrands;
  const sanityCollections = brandsNavigation?.collections;

  // Top brands: from Sanity or fallback to getAllBrands()
  const topBrands = sanityTopBrands && sanityTopBrands.length > 0
    ? sanityTopBrands
    : await getAllBrands(locale).then((b) => b.slice(0, 20));

  // Collections: from Sanity or fallback to menu sub-items
  const collections = sanityCollections && sanityCollections.length > 0
    ? sanityCollections.map((col) => {
        const resolved = resolveCollectionLink(col.collectionData, locale);
        return { title: col.title || resolved.title || '', url: resolved.handle || '' };
      }).filter((c) => c.title && c.url)
    : items
        .flatMap((item) =>
          item.items.length > 0
            ? item.items.flatMap((sub) => sub.items.map((child) => ({ title: child.title, url: child.url })))
            : []
        )
        .filter((v, i, a) => a.findIndex((t) => t.url === v.url) === i)
        .slice(0, 8);

  const menu = items.map((item, index) => {
    if (item.items.length > 0) {
      return (
        <React.Fragment key={index}>
          {item.items.map((subItem) => {
            const subItemUrls = [
              subItem.url,
              ...subItem.items.map((child) => child.url),
            ];

            return (
              <NavigationMenuItem
                key={subItem.url + subItem.title + gender}
                className=" group"
              >
                <NavigationTriggerClient urls={subItemUrls}>
                  {subItem.title}
                </NavigationTriggerClient>
                <NavigationMenuContent className="flex justify-between px-4">
                  <div className="flex w-full">
                    <div className="container w-full flex justify-between min-h-[300px]">
                      <ul className="grid h-fit gap-2 md:w-lg lg:w-3xl md:grid-cols-[.75fr_1fr] lg:grid-cols-[.75fr_1fr] ">
                        {subItem.items.map((child) => (
                          <li
                            key={child.title + gender}
                            className="w-full row-span-3 ml-2"
                          >
                            <NavigationItemClient href={child.url}>
                              <Button
                                variant={'ghost'}
                                className="text-base font-300 font-sans w-full inline-block  hover:underline transition-colors border-none"
                              >
                                {child.title}
                              </Button>
                            </NavigationItemClient>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          })}
        </React.Fragment>
      );
    } else {
      return (
        <NavigationMenuItem
          key={item.title}
          className={` ${index === items.length - 1 ? 'hidden lg:block' : 'block'}`}
        >
          <NavigationMenuLink asChild>
            <NavigationItemClient href={item.url}>
              {item.title}
            </NavigationItemClient>
          </NavigationMenuLink>
        </NavigationMenuItem>
      );
    }
  });
  return (
    <NavigationClient className=" pt-2 w-full">
      {menu}
      <NavigationMenuItem className="group">
        <NavigationTriggerClient urls={['/brands']}>
          {t('title')}
        </NavigationTriggerClient>
        <NavigationMenuContent className="flex justify-between px-4">
          <div className="flex w-full">
            <div className="container w-full flex py-5 gap-8">
              {/* КОЛЕКЦІЇ column */}
              {/* <div className="shrink-0 min-w-[140px]">
                <h3 className="text-xs font-bold uppercase tracking-wider underline mb-3">
                  {t('collections')}
                </h3>
                <ul className="space-y-1.5">
                  {collections.map((col) => (
                    <li key={String(col.title)}>
                      <Link
                        href={col.url}
                        className="text-sm hover:underline transition-colors"
                      >
                        {String(col.title)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div> */}

              {/* TOP BRANDS columns */}
              <div className="flex-1">
                <h3 className="text-xs font-bold uppercase tracking-wider underline mb-3">
                  {t('topBrands')}
                </h3>
                <div className="grid grid-flow-col grid-rows-[repeat(10,minmax(0,auto))] gap-x-8 gap-y-1.5">
                  {topBrands.slice(0, 20).map((brand) => (
                    <Link
                      key={brand}
                      href={`/brand/${vendorToHandle(brand)}`}
                      className="text-sm hover:underline transition-colors"
                    >
                      {brand}
                    </Link>
                  ))}
                </div>
              </div>

              {/* A-Z index + All brands link */}
              <div className="shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-wider underline mb-3">
                  A - Z
                </h3>
                <div className="grid grid-cols-5 gap-x-3 gap-y-1.5 mb-4">
                  {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                    <Link
                      key={letter}
                      href={`/brands#letter-${letter}`}
                      className="text-sm font-medium hover:text-primary transition-colors text-center"
                    >
                      {letter}
                    </Link>
                  ))}
                  <Link
                    href="/brands"
                    className="text-sm font-medium hover:text-primary transition-colors text-center"
                  >
                    0-9
                  </Link>
                </div>
                <Link
                  href="/brands"
                  className="text-sm font-medium underline hover:text-primary transition-colors"
                >
                  {t('allBrands')}
                </Link>
              </div>
            </div>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationClient>
  );
};
export default Navigation;
