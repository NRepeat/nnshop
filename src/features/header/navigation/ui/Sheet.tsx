import { getTranslations } from 'next-intl/server';
import { getMainMenu } from '../api/getMainMenu';
import { getLocale } from 'next-intl/server';
import NavigationSheet from './NavigationSheet';

const Sheet = async () => {
  const t = await getTranslations('Header.nav.drawer');
  const locale = await getLocale();
  const controller = new AbortController();
  const signal = controller.signal;
  const meinMenuRequest = await Promise.all([
    getMainMenu({ gender: 'woman', locale, signal }),
    getMainMenu({ gender: 'man', locale, signal }),
  ]);
  const meinMenu = [
    { label: 'woman', menu: meinMenuRequest[0] },
    { label: 'man', menu: meinMenuRequest[1] },
    { label: 'new-arrivals', menu: [] },
  ];
  return <NavigationSheet meinMenu={meinMenu} title={t('title')} />;
};

export default Sheet;
