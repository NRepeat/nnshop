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
  imageTitle?: string | null;
  imageButtonLabel?: string | null;
};

type NavImages = {
  woman?: NavImage[] | null;
  man?: NavImage[] | null;
} | null;

type SanityColumnItem = { _id: string; title: string; handle: string } | null;
type SanityColumn = { title: string; url?: string | null; items?: SanityColumnItem[] | null };
type SanityDropdown = { menuIndex: number; columns?: SanityColumn[] | null };
type NavDropdowns = {
  woman?: SanityDropdown[] | null;
  man?: SanityDropdown[] | null;
} | null;

export const CurrentNavigationSession = async ({
  locale,
  gender,
  navImages,
  navDropdowns,
}: {
  locale: string;
  gender?: string;
  navImages?: NavImages;
  navDropdowns?: NavDropdowns;
}) => {
  const cookie = await cookies();
  const currentGender = gender || cookie.get('gender')?.value || 'woman';
  return (
    <Navigation gender={currentGender} locale={locale} navImages={navImages} navDropdowns={navDropdowns} />
  );
};

export const CurrentNavigationSessionSkeleton = () => {
  const mainMenu = [
    { slug: 'home', title: 'Home', items: [] },
    { slug: 'about', title: 'About', items: [] },
    { slug: 'about', title: 'About', items: [] },
    { slug: 'about', title: 'About', items: [] },
  ];
  const menu = mainMenu.map((item, index) => {
    return (
      <NavigationMenuItem
        key={`${item.title}-${index}`}
        className={` ${index === mainMenu.length - 1 ? 'block' : 'block'}`}
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
  navDropdowns,
}: {
  gender: string;
  locale: string;
  navImages?: NavImages;
  navDropdowns?: NavDropdowns;
}) => {
  const [allItems, t] = await Promise.all([
    getMainMenu({ locale }),
    getTranslations({ locale, namespace: 'BrandsPage' }),
  ]);

  // Filter by gender
  const mainMenu = allItems.filter((item) => matchesGender(item, gender));
  const items = mainMenu.length > 0 ? mainMenu : allItems.slice(0, 1);

  // Collect all child handles to prefetch their featured images
  // Collect from Sanity navDropdowns + Shopify fallback
  const sanityHandles = (
    navDropdowns?.[gender as 'woman' | 'man'] ?? []
  ).flatMap((d) =>
    (d.columns ?? []).flatMap((col) =>
      (col.items ?? []).filter((item): item is NonNullable<SanityColumnItem> => item != null).map((item) => item.handle),
    ),
  );
  const shopifyHandles = items.flatMap((item) =>
    item.items
      .filter((sub) => !isBrandsItem(sub))
      .flatMap((sub) => {
        const hasSubItems = sub.items.some((g) => g.items.length > 0);
        return hasSubItems
          ? sub.items
              .filter((g) => !isBrandsItem(g))
              .flatMap((g) => g.items.map((child) => child.url.replace(/^\//, '')))
          : sub.items.map((child) => child.url.replace(/^\//, ''));
      }),
  );
  const allChildHandles = [...new Set([...sanityHandles, ...shopifyHandles])];
  const collectionImages = await getCollectionImages(
    allChildHandles,
    locale,
  ).catch(() => ({}) as Record<string, string | null>);

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
                genderImages.find(
                  (img) => img.menuIndex != null && img.menuIndex === subIndex,
                ) ?? genderImages[subIndex];
              const defaultImage = navImage?.imageUrl
                ? {
                    imageUrl: navImage.imageUrl,
                    imageWidth: navImage.imageWidth,
                    imageHeight: navImage.imageHeight,
                    href: navImage.collectionHandle
                      ? `/${gender}/${navImage.collectionHandle}`
                      : (navImage.url ?? '#'),
                    alt: navImage.collectionTitle ?? '',
                    imageTitle: navImage.imageTitle ?? null,
                    imageButtonLabel: navImage.imageButtonLabel ?? null,
                  }
                : null;

              // Try Sanity columns first, fallback to Shopify items
              const genderDropdowns = navDropdowns?.[gender as 'woman' | 'man'] ?? [];
              const sanityDropdown = genderDropdowns.find(
                (d) => d.menuIndex === subIndex,
              );
              const columns = sanityDropdown?.columns?.length
                ? sanityDropdown.columns.map((col) => ({
                    title: col.title,
                    url: col.url ? withGender(`/${col.url}`) : withGender(subItem.url),
                    items: (col.items ?? []).filter((item): item is NonNullable<SanityColumnItem> => item != null).map((item) => ({
                      title: item.title,
                      url: withGender(`/${item.handle}`),
                      collectionImageUrl:
                        collectionImages[item.handle] ?? null,
                    })),
                  }))
                : // Fallback: Shopify 4-level — level 3 = column, level 4 = items
                  // If level 3 has sub-items → treat as columns; otherwise flat single column
                  (() => {
                    const nonBrandsGroups = subItem.items.filter(
                      (g) => !isBrandsItem(g),
                    );
                    const hasSubItems = nonBrandsGroups.some(
                      (g) => g.items.length > 0,
                    );
                    if (hasSubItems) {
                      return nonBrandsGroups.slice(0, 2).map((group) => ({
                        title: group.title,
                        url: withGender(group.url),
                        items: group.items.map((child) => ({
                          title: child.title,
                          url: withGender(child.url),
                          collectionImageUrl:
                            collectionImages[child.url.replace(/^\//, '')] ??
                            null,
                        })),
                      }));
                    }
                    // flat fallback (only 3 levels in Shopify)
                    return [
                      {
                        title: subItem.title,
                        url: withGender(subItem.url),
                        items: nonBrandsGroups.map((child) => ({
                          title: child.title,
                          url: withGender(child.url),
                          collectionImageUrl:
                            collectionImages[child.url.replace(/^\//, '')] ??
                            null,
                        })),
                      },
                    ];
                  })();

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
                      columns={columns}
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
          <NavigationMenuContent className="px-6 ">
            <div className="flex gap-10 py-8  w-full   justify-center">
              <div className="flex-1 max-w-5xl">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  {t('topBrands')}
                </p>
                <ul className="grid grid-cols-2 gap-x-8 gap-y-1 ">
                  {topBrands.slice(0, 10).map((brand) => (
                    <li
                      key={brand.title}
                      className="w-full group rounded hover:shadow hover:bg-secondary/50 transition-colors duration-200"
                    >

                      <NavigationItemClient
                        className="w-full "
                        href={`/brend${brand.url}`}
                      >
                        <Button
                          variant={'ghost'}
                          className="text-base font-normal font-sans w-full justify-start px-2 group-hover:underline transition-colors border-none h-9"
                        >
                          {brand.title}
                        </Button>
                      </NavigationItemClient>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <NavigationItemClient href="/brands" className="pl-0">
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
                      className="border-none rounded text-base font-medium hover:shadow hover:bg-secondary/50 transition-colors duration-200 text-center rounded w-9 h-9 flex items-center justify-center"
                    >
                      {letter}
                    </NavigationContentLink>
                  ))}
                  <NavigationContentLink
                    href="/brands"
                    className="border-none text-base font-medium hover:shadow hover:bg-secondary/50 transition-colors duration-200 text-center rounded w-9 h-9 flex items-center justify-center"
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
