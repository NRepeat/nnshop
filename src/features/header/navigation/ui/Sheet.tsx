import { getTranslations } from 'next-intl/server';
import { getMainMenu } from '../api/getMainMenu';
import NavigationSheet from './NavigationSheet';
import { cookies } from 'next/headers';
import { stripGenderFromHandle } from '../utils/strip-gender-from-handle';
import { sanityFetch } from '@shared/sanity/lib/client';
import { FOOTER_QUERY } from '@shared/sanity/lib/query';

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

const MenuSheet = async ({ locale }: { locale: string }) => {
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || 'woman';

  const [t, allItems, footerData] = await Promise.all([
    getTranslations({ locale, namespace: 'Header.nav.drawer' }),
    getMainMenu({ locale }),
    sanityFetch({ query: FOOTER_QUERY, tags: ['siteSettings', 'footer'] }),
  ]);

  // Filter by gender
  const mainMenuRaw = allItems.filter((item) => matchesGender(item, gender));
  const items = mainMenuRaw.length > 0 ? mainMenuRaw : allItems.slice(0, 1);

  // Find brands item nested inside the gender category's sub-items
  const brandsMenuItem = items
    .flatMap((item) => item.items)
    .find((subItem) => isBrandsItem(subItem));

  const withGender = (url: string) => {
    const stripped = stripGenderFromHandle(url);
    // Avoid /woman/woman — menu item that points to the gender home itself
    if (stripped === `/${gender}`) return `/${gender}`;
    return `/${gender}${stripped}`;
  };

  const menuItems = items.flatMap((item) => {
    return item.items
      .filter((subItem) => !isBrandsItem(subItem))
      .map((subItem) => ({
        label: subItem.title,
        menu: [
          {
            ...subItem,
            url: withGender(subItem.url),
            items: subItem.items.map((child) => ({
              ...child,
              url: withGender(child.url),
            })),
          },
        ],
      }));
  });

  // Add brands as a simple link (no expandable sub-items on mobile)
  if (brandsMenuItem) {
    menuItems.push({
      label: brandsMenuItem.title,
      menu: [
        {
          ...brandsMenuItem,
          url: '/brands',
          items: [],
        },
      ],
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
    />
  );
};

export default MenuSheet;
