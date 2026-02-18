import React from 'react';
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@shared/ui/navigation-menu';
import { getMainMenu } from '../api/getMainMenu';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { NavigationClient } from './NavigationClient';
import { Skeleton } from '@shared/ui/skeleton';
import { NavigationItemClient } from './NavigationItemClient';
import { NavigationTriggerClient } from './NavigationTriggerClient';
import { Button } from '@shared/ui/button';
import { NavigationContentLink } from './NavigationContentLink';
import { vendorToHandle } from '@shared/lib/utils/vendorToHandle';

export const CurrentNavigationSession = async ({
  locale,
  gender,
}: {
  locale: string;
  gender?: string;
}) => {
  const cookie = await cookies();
  const currentGender = gender || cookie.get('gender')?.value || 'woman';
  return <Navigation gender={currentGender} locale={locale} />;
};

export const CurrentNavigationSessionSkilet = () => {
  const meinMenu = [
    { slug: 'home', title: 'Home', items: [] },
    { slug: 'about', title: 'About', items: [] },
    { slug: 'about', title: 'About', items: [] },
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

const brandSlugs = ['brand', 'бренд', 'брендi', 'бренди'];

function matchesGender(
  item: { url: string; title: string },
  gender: string,
): boolean {
  const slug = item.url.split('/').pop()?.toLowerCase() || '';
  const title = item.title.toLowerCase();
  const slugs = genderSlugMap[gender] || [];
  return slugs.some((s) => slug.includes(s) || title.includes(s));
}

function isBrandsItem(item: { url: string; title: string }): boolean {
  const slug = item.url.split('/').pop()?.toLowerCase() || '';
  const title = item.title.toLowerCase();
  return brandSlugs.some((s) => slug.includes(s) || title.includes(s));
}

const Navigation = async ({
  gender,
  locale,
}: {
  gender: string;
  locale: string;
}) => {
  const allItems = await getMainMenu({ locale });
  const t = await getTranslations({ locale, namespace: 'BrandsPage' });

  // Find brands item from Shopify menu
  const brandsMenuItem = allItems.find((item) => isBrandsItem(item));

  // Filter by gender, excluding brands item to avoid duplicate keys
  const meinMenu = allItems.filter(
    (item) => matchesGender(item, gender) && !isBrandsItem(item),
  );
  const items = meinMenu.length > 0 ? meinMenu : allItems.filter((i) => !isBrandsItem(i)).slice(0, 1);
  const topBrands =
    brandsMenuItem?.items?.flatMap((sub) =>
      sub.items?.length > 0
        ? sub.items.map((child) => child.title)
        : [sub.title],
    ) || [];

  const withGender = (url: string) => `/${gender}${url}`;

  const menu = items.map((item, index) => {
    if (item.items.length > 0) {
      return (
        <React.Fragment key={item.url + item.title}>
          {item.items.map((subItem) => {
            const subItemUrls = [
              withGender(subItem.url),
              ...subItem.items.map((child) => withGender(child.url)),
            ];

            return (
              <NavigationMenuItem
                key={subItem.url + subItem.title + gender}
                className=" group"
              >
                <NavigationTriggerClient urls={subItemUrls}>
                  {subItem.title}
                </NavigationTriggerClient>
                <NavigationMenuContent className="px-4">
                  <div className="flex gap-10 py-8 px-6">
                    <div className="flex-1">
                      <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
                        {subItem.items.map((child) => (
                          <li key={child.title + gender}>
                            <NavigationItemClient href={withGender(child.url)}>
                              <Button
                                variant={'ghost'}
                                className="text-base font-normal font-sans w-full justify-start px-2 hover:underline transition-colors border-none h-9"
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
          key={item.url + item.title}
          className={` ${index === items.length - 1 ? 'hidden lg:block' : 'block'}`}
        >
          <NavigationMenuLink asChild>
            <NavigationItemClient href={withGender(item.url)}>
              {item.title}
            </NavigationItemClient>
          </NavigationMenuLink>
        </NavigationMenuItem>
      );
    }
  });
  return (
    <NavigationClient key={locale} className=" pt-2 w-full">
      {menu}
      {brandsMenuItem && (
        <NavigationMenuItem className="group">
          <NavigationTriggerClient urls={['/brands']}>
            {brandsMenuItem.title}
          </NavigationTriggerClient>
          <NavigationMenuContent className="px-4">
            <div className="flex gap-10 py-8 px-6">
              <div className="flex-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  {t('topBrands')}
                </h3> 
                <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
                  {topBrands.slice(0, 10).map((brand) => (
                    <li key={brand}>
                      <NavigationItemClient
                        href={`/brand/${vendorToHandle(brand)}`}
                      >
                        <Button
                          variant={'ghost'}
                          className="text-base font-normal font-sans w-full justify-start px-2 hover:underline transition-colors border-none h-9"
                        >
                          {brand}
                        </Button>
                      </NavigationItemClient>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 ">
                  <NavigationItemClient href="/brands">
                    <span className="text-base font-medium underline hover:text-primary transition-colors">
                      {t('allBrands')} →
                    </span>
                  </NavigationItemClient>
                </div>
              </div>
              <div className="border-l border-muted pl-8 shrink-0">
                {/* <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  A - Z
                </h3> */}
                <div className="grid grid-cols-7 gap-x-2 gap-y-2">
                  {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                    <NavigationContentLink
                      key={letter}
                      href={`/brands#letter-${letter}`}
                      className="text-base font-medium hover:text-primary hover:bg-accent transition-colors text-center rounded-md w-9 h-9 flex items-center justify-center"
                    >
                      {letter}
                    </NavigationContentLink>
                  ))}
                  <NavigationContentLink
                    href="/brands"
                    className="text-base font-medium hover:text-primary hover:bg-accent transition-colors text-center rounded-md w-9 h-9 flex items-center justify-center"
                  >
                    #
                  </NavigationContentLink>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      )}
    </NavigationClient>
  );
};
export default Navigation;
