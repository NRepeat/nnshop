import React from 'react';
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@shared/ui/navigation-menu';
import { DEFAULT_GENDER, GENDERS } from '@shared/config/shop';
import { getMainMenu } from '../api/getMainMenu';
import { getCollectionImages } from '../api/getCollectionImages';
import { getTranslations } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { NavigationClient } from './NavigationClient';
import { Skeleton } from '@shared/ui/skeleton';
import { NavigationItemClient } from './NavigationItemClient';
import { NavigationTriggerClient } from './NavigationTriggerClient';
import { NavigationContentLink } from './NavigationContentLink';
import { NavDropdownContent } from './NavDropdownContent';
import { stripGenderFromHandle } from '../utils/strip-gender-from-handle';
import { Button } from '@shared/ui/button';
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

type NavImages = {
  woman?: NavImage[] | null;
  man?: NavImage[] | null;
} | null;

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
  const [cookie, headersList] = await Promise.all([cookies(), headers()]);
  const cookieGender = cookie.get('gender')?.value;
  // x-gender is set by middleware from the URL — takes priority over the cookie
  // to avoid showing stale gender when user navigates across genders.
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
      navImages={navImages}
      navDropdowns={navDropdowns}
    />
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
   {
    return  (d.columns ?? []).flatMap((col) =>
      (col.items ?? [])
        .filter((item): item is NonNullable<SanityColumnItem> => item != null)
        .map((item) => item.handle),
    )
   }
  );
  const shopifyHandles = items.flatMap((item) =>
    item.items
      .filter((sub) => !isBrandsItem(sub))
      .flatMap((sub) => {
        const hasSubItems = sub.items.some((g) => g.items.length > 0);
        return hasSubItems
          ? sub.items
              .filter((g) => !isBrandsItem(g))
              .flatMap((g) =>
                g.items.map((child) => child.url.replace(/^\//, '')),
              )
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
        ? sub.items.map((child) => ({
            title: child.title,
            url: cleanSlug(child.url),
          }))
        : [{ title: sub.title, url: cleanSlug(sub.url) }],
    ) || [];

  const withGender = (url: string) => {
    const stripped = cleanSlug(url);
    const path =
      stripped === `/${gender}` ? `/${gender}` : `/${gender}${stripped}`;
    return cleanSlug(path);
  };

  const seenUrls = new Set<string>();
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

              const genderDropdowns =
                navDropdowns?.[gender as 'woman' | 'man'] ?? [];
              const sanityDropdown = genderDropdowns.find(
                (d) => d.menuIndex === subIndex,
              );
              const columns = sanityDropdown?.columns?.length
                ? sanityDropdown.columns.map((col) => {
                    const colUrl = col.url ? withGender(`/${col.url}`) : null;
                    return {
                      title: col.title,
                      url: colUrl,
                      items: (col.items ?? [])
                        .filter(
                          (item): item is NonNullable<SanityColumnItem> =>
                            item != null,
                        )
                        .map((item) => {
                          const itemUrl = withGender(`/${item.handle}`);
                          const isDuplicate = seenUrls.has(itemUrl);
                          seenUrls.add(itemUrl);
                          return {
                            title: item.title,
                            url: itemUrl,
                            isDuplicate,
                            collectionImageUrl:
                              collectionImages[item.handle] ?? null,
                            navTitleColor: item.navTitleColor ?? null,
                          };
                        }),
                      outletLink: col.outletLink?.label
                        ? {
                            label: col.outletLink.label,
                            url: col.outletLink.collectionHandle
                              ? withGender(
                                  `/${col.outletLink.collectionHandle}`,
                                )
                              : (col.outletLink.url ?? '#'),
                          }
                        : null,
                      actionButton: col.actionButton?.label
                        ? {
                            label: col.actionButton.label,
                            url: col.actionButton.collectionHandle
                              ? withGender(
                                  `/${col.actionButton.collectionHandle}`,
                                )
                              : col.actionButton.url
                                ? col.actionButton.url
                                : col.url
                                  ? withGender(`/${col.url}`)
                                  : withGender(subItem.url),
                          }
                        : null,
                    };
                  })
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
                        items: group.items.map((child) => {
                          const itemUrl = withGender(child.url);
                          const isDuplicate = seenUrls.has(itemUrl);
                          seenUrls.add(itemUrl);
                          return {
                            title: child.title,
                            url: itemUrl,
                            isDuplicate,
                            collectionImageUrl:
                              collectionImages[child.url.replace(/^\//, '')] ??
                              null,
                          };
                        }),
                      }));
                    }
                    // flat fallback (only 3 levels in Shopify)
                    return [
                      {
                        title: subItem.title,
                        url: withGender(subItem.url),
                        items: nonBrandsGroups.map((child) => {
                          const itemUrl = withGender(child.url);
                          const isDuplicate = seenUrls.has(itemUrl);
                          seenUrls.add(itemUrl);
                          return {
                            title: child.title,
                            url: itemUrl,
                            isDuplicate,
                            collectionImageUrl:
                              collectionImages[child.url.replace(/^\//, '')] ??
                              null,
                          };
                        }),
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
                    className="hover:underline duration-300 decoration-transparent hover:decoration-primary transition-all "
                  >
                    {subItem.title}
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
          <NavigationMenuContent className="px-4 w-full flex justify-center">
            <div className="flex gap-10 px-6 w-full py-8 justify-between max-w-6xl">
              <div className="flex-1 min-w-[180px] max-w-[260px]">
                <NavigationItemClient className="block mb-3 px-4">
                  <p className="text-base font-semibold tracking-wide border-b border-border pb-2">
                    {t('topBrands')}
                  </p>
                </NavigationItemClient>
                <ul className="flex flex-col gap-0.5">
                  {topBrands.slice(0, 5).map((brand) => (
                    <li
                      key={brand.title}
                      className="w-full group rounded hover:shadow hover:bg-secondary/50 transition-colors duration-200"
                    >
                      <NavigationItemClient
                        className="w-full rounded px-0"
                        href={`/brand${brand.url}`}
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
                  {topBrands.slice(5, 10).map((brand) => (
                    <li
                      key={brand.title}
                      className="w-full group rounded hover:shadow hover:bg-secondary/50 transition-colors duration-200"
                    >
                      <NavigationItemClient
                        className="w-full rounded px-0"
                        href={`/brand${brand.url}`}
                      >
                        <Button
                          variant="ghost"
                          className="group-hover:underline duration-300 decoration-transparent  hover:decoration-primary transition-all text-base font-normal font-sans w-full justify-start px-4 border-none rounded"
                        >
                          {brand.title}
                        </Button>
                      </NavigationItemClient>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-border pt-3">
                  <NavigationItemClient href="/brands" className="px-0">
                    <span className="text-sm font-medium hover:underline transition-all px-4">
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
                      className="border-none rounded text-base font-medium hover:shadow hover:bg-secondary/50 transition-colors duration-200 text-center w-9 h-9 flex items-center justify-center"
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
