import { getTranslations } from 'next-intl/server';
import { getMainMenu } from '../api/getMainMenu';
import NavigationSheet from './NavigationSheet';

const MenuSheet = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({
    locale,
    namespace: 'Header.nav.drawer',
  });
  const items = await getMainMenu({ locale });
  const meinMenu = items.map((item) => ({
    label: item.title,
    menu: [item],
  }));
  return (
    <NavigationSheet meinMenu={meinMenu} title={t('title')} locale={locale} />
  );
};

export default MenuSheet;
