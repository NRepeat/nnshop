import React from 'react';
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@shared/ui/navigation-menu';
import { getMainMenu } from '../api/getMainMenu';
import { getCollectionImages } from '../api/getCollectionImages';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { NavigationClient } from './NavigationClient';
import { Skeleton } from '@shared/ui/skeleton';
import { NavigationItemClient } from './NavigationItemClient';
import { NavigationTriggerClient } from './NavigationTriggerClient';
import { NavigationContentLink } from './NavigationContentLink';
import { NavDropdownContent } from './NavDropdownContent';
import { stripGenderFromHandle } from '../utils/strip-gender-from-handle';
import { Button } from '@shared/ui/button';

type NavImage = {
  _key?: string | null;
  url?: string | null;
  menuIndex?: number | null;
  imageUrl?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  collectionHandle?: string | null;
  collectionTitle?: string | null;
};

type NavImages = {
  woman?: NavImage[] | null;
  man?: NavImage[] | null;
} | null;

export const CurrentNavigationSession = async ({
  locale,
  gender,
  navImages,
}: {
  locale: string;
  gender?: string;
  navImages?: NavImages;
}) => {
  const cookie = await cookies();
  const currentGender = gender || cookie.get('gender')?.value || 'woman';
  return (
    <Navigation gender={currentGender} locale={locale} navImages={navImages} />
  );
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
        key={`${item.title}-${index}`}
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
    'zhinochi',
  ],
  man: [
    'man',
    'men',
    'male',
    'муж',
    'мужчин',
    'чолов',
    'cholovik',
    'cholovichi',
  ],
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
  navImages,
}: {
  gender: string;
  locale: string;
  navImages?: NavImages;
}) => {
  const [allItems, t] = await Promise.all([
    getMainMenu({ locale }),
    getTranslations({ locale, namespace: 'BrandsPage' }),
  ]);

  // Filter by gender
  const meinMenu = allItems.filter((item) => matchesGender(item, gender));
  const items = meinMenu.length > 0 ? meinMenu : allItems.slice(0, 1);

  // Collect all child handles to prefetch their featured images
  const allChildHandles = items.flatMap((item) =>
    item.items
      .filter((sub) => !isBrandsItem(sub))
      .flatMap((sub) => sub.items.map((child) => child.url.replace(/^\//, ''))),
  );
  const collectionImages = await getCollectionImages(allChildHandles, locale).catch(() => ({} as Record<string, string | null>));

  // Find brands item nested inside the gender category's sub-items
  const brandsMenuItem = items
    .flatMap((item) => item.items)
    .find((subItem) => isBrandsItem(subItem));

  const topBrands =
    brandsMenuItem?.items?.flatMap((sub) =>
      sub.items?.length > 0
        ? sub.items.map((child) => ({ title: child.title, url: child.url }))
        : [{ title: sub.title, url: sub.url }],
    ) || [];

  const withGender = (url: string) => {
    const stripped = stripGenderFromHandle(url);
    // Avoid /woman/woman — menu item that points to the gender home itself
    if (stripped === `/${gender}`) return `/${gender}`;
    return `/${gender}${stripped}`;
  };

  const menu = items.map((item, index) => {
    if (item.items.length > 0) {
      return (
        <React.Fragment key={item.url + item.title}>
          {item.items
            .filter((subItem) => !isBrandsItem(subItem))
            .map((subItem, subIndex) => {
              const genderImages = navImages?.[gender as 'woman' | 'man'] ?? [];
              const navImage =
                genderImages.find((img) => img.menuIndex != null && img.menuIndex === subIndex)
                ?? genderImages[subIndex];
              const defaultImage = navImage?.imageUrl
                ? {
                    imageUrl: navImage.imageUrl,
                    imageWidth: navImage.imageWidth,
                    imageHeight: navImage.imageHeight,
                    href: navImage.collectionHandle
                      ? `/${gender}/${navImage.collectionHandle}`
                      : (navImage.url ?? '#'),
                    alt: navImage.collectionTitle ?? '',
                  }
                : null;

              const childItems = subItem.items.map((child) => ({
                title: child.title,
                url: withGender(child.url),
                collectionImageUrl: collectionImages[child.url.replace(/^\//, '')] ?? null,
              }));

              return (
                <NavigationMenuItem
                  key={subItem.url + subItem.title + gender}
                  className="group"
                >
                  <NavigationTriggerClient
                    href={withGender(subItem.url)}
                    className="hover:underline duration-300 decoration-transparent hover:decoration-primary transition-all"
                  >
                    {subItem.title}
                  </NavigationTriggerClient>
                  <NavigationMenuContent className="px-4">
                    <NavDropdownContent
                      children={childItems}
                      defaultImage={defaultImage}
                      gender={gender}
                    />
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
      <>
        {menu}

        <NavigationMenuItem className="group">
          <NavigationTriggerClient
            href="/brands"
            className="hover:underline duration-300 decoration-transparent hover:decoration-primary transition-all"
          >
            {t('title')}
          </NavigationTriggerClient>
          <NavigationMenuContent className="px-4">
            <div className="flex gap-10 py-8 px-6">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  {t('topBrands')}
                </p>
                <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
                  {topBrands.slice(0, 10).map((brand) => (
                    <li key={brand.title} className="w-full">
                      <NavigationItemClient
                        className="w-full"
                        href={`/brend${brand.url}`}
                      >
                        <Button
                          variant={'ghost'}
                          className="text-base font-normal font-sans w-full justify-start px-2 hover:underline transition-colors border-none h-9"
                        >
                          {brand.title}
                        </Button>
                      </NavigationItemClient>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <NavigationItemClient href="/brands">
                    <span className="text-base font-medium underline hover:text-primary transition-colors">
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
                      className="border-none text-base font-medium hover:text-primary hover:bg-accent transition-colors text-center rounded w-9 h-9 flex items-center justify-center"
                    >
                      {letter}
                    </NavigationContentLink>
                  ))}
                  <NavigationContentLink
                    href="/brands"
                    className="border-none text-base font-medium hover:text-primary hover:bg-accent transition-colors text-center rounded w-9 h-9 flex items-center justify-center"
                  >
                    #
                  </NavigationContentLink>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </>
    </NavigationClient>
  );
};
export default Navigation;
