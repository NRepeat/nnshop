import { getTranslations } from 'next-intl/server';
import NavigationSheet from './NavigationSheet';
import { cookies } from 'next/headers';
import { DEFAULT_GENDER } from '@shared/config/shop';
import { cleanSlug } from '@shared/lib/utils/cleanSlug';
import { sanityFetch } from '@shared/sanity/lib/sanityFetch';
import { FOOTER_QUERY } from '@shared/sanity/lib/query';
import { HEADER_QUERYResult } from '@shared/sanity/types';
import { getMainMenu } from '../api/getMainMenu';
import { Maybe } from '@shared/lib/shopify/types/storefront.types';

type MainCategory = NonNullable<
  Extract<NonNullable<HEADER_QUERYResult>['header'], { _type: 'header' }>['mainCategory']
>;

export type NavDropdowns = {
  woman?: Array<{
    _key: string;
    menuIndex: number | null;
    columns?: Array<{
      _key: string;
      title: string | '';
      url: string | null;
      items?: Array<{ _id: string; title: string | ''; handle: string | null }> | null;
      outletLink?: { label: string | ''; collectionHandle: string | null; url: string | null } | null;
    }> | null;
  }> | null;
  man?: Array<{
    _key: string;
    menuIndex: number | null;
    columns?: Array<{
      _key: string;
      title: string | '';
      url: string | null;
      items?: Array<{ _id: string; title: string | ''; handle: string | null }> | null;
      outletLink?: { label: string | ''; collectionHandle: string | null; url: string | null } | null;
    }> | null;
  }> | null;
} | null;

const genderSlugMap: Record<string, string[]> = {
  woman: ['woman', 'women', 'female', 'жен', 'женщин', 'жінк', 'zhinok', 'zhinoch', 'zhinochi'],
  man: ['man', 'men', 'male', 'муж', 'мужчин', 'чолов', 'cholovik', 'cholovichi'],
};

const brandSlugs = ['brand', 'бренд', 'брендi', 'бренди'];

function matchesGender(item: { url: string; title: string }, gender: string): boolean {
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

function getCategorySlug(category: MainCategory[number]): string {
  const data = category.collectionData;
  if (!data) return '';
  if ('pageHandle' in data && data.pageHandle) return data.pageHandle;
  if ('slug' in data && data.slug) return data.slug;
  return '';
}

function getCategoryTitle(category: MainCategory[number]): string {
  const t = category.title;
  if (typeof t === 'string') return t;
  return '';
}

const MenuSheet = async ({
  locale,
  mainCategory,
  navDropdowns,
}: {
  locale: string;
  mainCategory?: MainCategory | null;
  navDropdowns?: NavDropdowns | null;
}) => {
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || DEFAULT_GENDER;

  const [t, allItems, footerData] = await Promise.all([
    getTranslations({ locale, namespace: 'Header.nav.drawer' }),
    getMainMenu({ locale }),
    sanityFetch({ query: FOOTER_QUERY, tags: ['siteSettings', 'footer'] }),
  ]);

  const mainMenuRaw = allItems.filter((item) => matchesGender(item, gender));
  const items = mainMenuRaw.length > 0 ? mainMenuRaw : null;

  const withGender = (url: string) => {
    const stripped = cleanSlug(url);
    if (stripped === `/${gender}`) return `/${gender}`;
    return `/${gender}${stripped}`;
  };

  type SubItem = {
    id: Maybe<string> | undefined;
    title: string;
    url: string;
    items: { id: Maybe<string> | undefined; title: string; url: string }[];
  };

  type MenuEntry = {
    label: string;
    menu: {
      id: Maybe<string> | undefined;
      title: string;
      url: string;
      items: SubItem[];
      outletLink?: { label: string; url: string } | null;
    }[];
  };

  const menuItems: MenuEntry[] = [];
  const directLinks: { title: string; href: string }[] = [];

  const genderDropdowns = navDropdowns?.[gender as 'woman' | 'man'] ?? [];

  // Always show mainCategory items that have no navDropdowns (e.g. outlet) as direct red links
  if (mainCategory) {
    for (const cat of mainCategory) {
      const slug = (() => {
        const data = cat.collectionData;
        if (!data) return '';
        if ('pageHandle' in data && data.pageHandle) return data.pageHandle;
        if ('slug' in data && data.slug) return data.slug;
        return '';
      })();
      const title = typeof cat.title === 'string' ? cat.title : '';
      // Skip the current gender (it's shown as the main accordion menu)
      // Skip woman/man since they have their own full menu
      if (!slug || slug === gender || navDropdowns?.[slug as 'woman' | 'man']?.length) continue;
      directLinks.push({ title, href: `/${slug}` });
    }
  }

  if (items) {
    items.flatMap((item) =>
      item.items
        .filter((subItem) => !isBrandsItem(subItem))
        .forEach((subItem, subIndex) => {
          // Find the matching Sanity navDropdown for this menu index
          const sanityDropdown = genderDropdowns.find((d) => d.menuIndex === subIndex);

          let menuSubItems: SubItem[];

          if (sanityDropdown?.columns?.length) {
            // Use Sanity column items (flattened across columns)
            menuSubItems = sanityDropdown.columns.flatMap((col) =>
              (col.items ?? [])
                .filter((i) => i.handle)
                .map((i) => ({
                  id: i._id,
                  title: typeof i.title === 'string' ? i.title : '',
                  url: withGender(`/${i.handle!}`),
                  items: [],
                })),
            );
          } else {
            // Fallback to Shopify sub-items
            menuSubItems = subItem.items.map((child) => ({
              id: child.id,
              title: child.title,
              url: withGender(child.url),
              items: [],
            }));
          }

          // Pick first outletLink from Sanity columns
          const rawOutlet = sanityDropdown?.columns
            ?.map((col) => col.outletLink)
            .find((ol) => ol && ol.label);
          const outletLink = rawOutlet
            ? {
                label: typeof rawOutlet.label === 'string' ? rawOutlet.label : '',
                url: rawOutlet.collectionHandle
                  ? withGender(`/${rawOutlet.collectionHandle}`)
                  : (rawOutlet.url ?? `/${gender}`),
              }
            : null;

          menuItems.push({
            label: subItem.title,
            menu: [
              {
                ...subItem,
                url: withGender(subItem.url),
                items: menuSubItems,
                outletLink,
              },
            ],
          });
        }),
    );

    const brandsMenuItem = items
      .flatMap((item) => item.items)
      .find((subItem) => isBrandsItem(subItem));

    if (brandsMenuItem) {
      menuItems.push({
        label: brandsMenuItem.title,
        menu: [{ ...brandsMenuItem, url: '/brands', items: [] }],
      });
    }
  } else {
    // No Shopify match (e.g. outlet gender) — show as a direct red link
    const sanityCategory = mainCategory?.find((cat) => getCategorySlug(cat) === gender);
    const title = sanityCategory ? getCategoryTitle(sanityCategory) : gender;
    directLinks.push({ title, href: `/${gender}` });
  }

  const socialLinks = footerData?.footerSettings?.socialLinks ?? [];

  return (
    // @ts-ignore
    <NavigationSheet
      mainMenu={menuItems}
      title={t('title')}
      locale={locale}
      socialLinks={socialLinks}
      directLinks={directLinks}
    />
  );
};

export default MenuSheet;
