import { getTranslations } from 'next-intl/server';
import { getMainMenu } from '../api/getMainMenu';
import NavigationSheet from './NavigationSheet';

const genderSlugMap: Record<string, string[]> = {
  woman: ['woman', 'women', 'female', 'жен', 'женщин', 'жінк', 'zhinok', 'zhinoch'],
  man: ['man', 'men', 'male', 'муж', 'мужчин', 'чолов', 'cholovik'],
};

function detectGender(item: { url: string; title: string }): string | null {
  const slug = item.url.split('/').pop()?.toLowerCase() || '';
  const title = item.title.toLowerCase();
  for (const [gender, slugs] of Object.entries(genderSlugMap)) {
    if (slugs.some((s) => slug.includes(s) || title.includes(s))) {
      return gender;
    }
  }
  return null;
}

const MenuSheet = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({
    locale,
    namespace: 'Header.nav.drawer',
  });
  const items = await getMainMenu({ locale });
  const meinMenu = items.map((item) => {
    const gender = detectGender(item);
    const withGender = (url: string) => (gender ? `/${gender}${url}` : url);

    return {
      label: item.title,
      menu: [
        {
          ...item,
          items: item.items.map((subItem) => ({
            ...subItem,
            url: withGender(subItem.url),
            items: subItem.items.map((subSubItem) => ({
              ...subSubItem,
              url: withGender(subSubItem.url),
            })),
          })),
        },
      ],
    };
  });
  return (
    <NavigationSheet meinMenu={meinMenu} title={t('title')} locale={locale} />
  );
};

export default MenuSheet;
