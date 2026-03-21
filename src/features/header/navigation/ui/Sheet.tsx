import { getTranslations } from 'next-intl/server';
import NavigationSheet from './NavigationSheet';
import { cookies } from 'next/headers';
import { DEFAULT_GENDER } from '@shared/config/shop';
import { cleanSlug } from '@shared/lib/utils/cleanSlug';
import { sanityFetch } from '@shared/sanity/lib/sanityFetch';
import { FOOTER_QUERY } from '@shared/sanity/lib/query';
import { HEADER_QUERYResult } from '@shared/sanity/types';

type MainCategory = NonNullable<
  Extract<NonNullable<HEADER_QUERYResult>['header'], { _type: 'header' }>['mainCategory']
>;

export type NavDropdowns = {
  woman?: Array<{
    _key: string;
    tabTitle?: string | null;
    tabUrl?: string | null;
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
    tabTitle?: string | null;
    tabUrl?: string | null;
    columns?: Array<{
      _key: string;
      title: string | '';
      url: string | null;
      items?: Array<{ _id: string; title: string | ''; handle: string | null }> | null;
      outletLink?: { label: string | ''; collectionHandle: string | null; url: string | null } | null;
    }> | null;
  }> | null;
} | null;

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

  const [t, footerData] = await Promise.all([
    getTranslations({ locale, namespace: 'Header.nav.drawer' }),
    sanityFetch({ query: FOOTER_QUERY, tags: ['siteSettings', 'footer'] }),
  ]);

  const withGender = (url: string) => {
    const stripped = cleanSlug(url);
    if (stripped === `/${gender}`) return `/${gender}`;
    return `/${gender}${stripped}`;
  };

  type SubItem = {
    id: string | null | undefined;
    title: string;
    url: string;
    items: { id: string | null | undefined; title: string; url: string }[];
  };

  type MenuEntry = {
    label: string;
    menu: {
      id: string | null | undefined;
      title: string;
      url: string;
      items: SubItem[];
      outletLink?: { label: string; url: string } | null;
    }[];
  };

  const menuItems: MenuEntry[] = [];
  const directLinks: { title: string; href: string }[] = [];

  // Always show mainCategory items that have no navDropdowns (e.g. outlet) as direct red links
  if (mainCategory) {
    for (const cat of mainCategory) {
      const slug = getCategorySlug(cat);
      const title = getCategoryTitle(cat);
      // Skip woman/man since they have their own full menu
      if (!slug || slug === gender || navDropdowns?.[slug as 'woman' | 'man']?.length) continue;
      directLinks.push({ title, href: `/${slug}` });
    }
  }

  // Tabs come from Sanity navDropdowns, sorted by menuIndex
  const tabs = navDropdowns?.[gender as 'woman' | 'man'] ?? [];

  for (const tab of tabs) {
    const tabLabel = tab.tabTitle ?? '';
    const tabUrl = tab.tabUrl
      ? tab.tabUrl.startsWith('/')
        ? tab.tabUrl
        : withGender(`/${tab.tabUrl}`)
      : `/${gender}`;

    // Category tab — column-based
    const menuSubItems: SubItem[] = (tab.columns ?? []).flatMap((col) =>
      (col.items ?? [])
        .filter((i) => i.handle)
        .map((i) => ({
          id: i._id,
          title: typeof i.title === 'string' ? i.title : '',
          url: withGender(`/${i.handle!}`),
          items: [],
        })),
    );

    const rawOutlet = tab.columns
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
      label: tabLabel,
      menu: [{ id: tab._key, title: tabLabel, url: tabUrl, items: menuSubItems, outletLink }],
    });
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
