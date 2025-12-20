import { getTranslations } from 'next-intl/server';
import { getMainMenu } from '../api/getMainMenu';
import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import NavigationSheet from './NavigationSheet';

const Sheet = async () => {
  const t = await getTranslations('Header.nav.drawer');
  const locale = await getLocale();
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || 'woman';
  const meinMenu = await Promise.all([
    getMainMenu({ gender: 'woman', locale }),
    getMainMenu({ gender: 'man', locale }),
  ]);

  return (
    <NavigationSheet meinMenu={meinMenu} gender={gender} title={t('title')} />
  );
};

export default Sheet;
