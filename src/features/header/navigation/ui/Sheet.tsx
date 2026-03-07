import { getTranslations } from 'next-intl/server';
import { getMainMenu } from '../api/getMainMenu';
import NavigationSheet from './NavigationSheet';
import { cookies } from 'next/headers';
import { stripGenderFromHandle } from '../utils/strip-gender-from-handle';

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
  
  const t = await getTranslations({
    locale,
    namespace: 'Header.nav.drawer',
  });
  
  const allItems = await getMainMenu({ locale });
  
  const brandsMenuItem = allItems.find((item) => isBrandsItem(item));

  // Filter by gender, excluding brands item to avoid duplicate keys
  const meinMenuRaw = allItems.filter(
    (item) => matchesGender(item, gender) && !isBrandsItem(item),
  );
  
  const items =
    meinMenuRaw.length > 0
      ? meinMenuRaw
      : allItems.filter((i) => !isBrandsItem(i)).slice(0, 1);

  const withGender = (url: string) => {
    const stripped = stripGenderFromHandle(url);
    // Avoid /woman/woman — menu item that points to the gender home itself
    if (stripped === `/${gender}`) return `/${gender}`;
    return `/${gender}${stripped}`;
  };

  const menuItems = items.flatMap((item) => {
    return item.items.map((subItem) => ({
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

  // Add brands menu item if it exists
  if (brandsMenuItem) {
    menuItems.push({
      label: brandsMenuItem.title,
      menu: [
        {
          ...brandsMenuItem,
          items: brandsMenuItem.items.map((subItem) => ({
            ...subItem,
            url: subItem.url,
            items: subItem.items.map((subSubItem) => ({
              ...subSubItem,
              url: subSubItem.url,
            })),
          })),
        },
      ],
    });
  }

  return (
    // @ts-ignore
    <NavigationSheet meinMenu={menuItems} title={t('title')} locale={locale} />
  );
};

export default MenuSheet;
