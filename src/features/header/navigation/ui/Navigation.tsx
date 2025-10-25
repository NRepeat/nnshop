import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const Navigation = async () => {
  const t = await getTranslations('Header.nav');

  return (
    <nav className="hidden md:block ">
      <ul className="flex flex-row flex-1 h-full items-center md:gap-6 font-medium text-8 max-w-sm">
        <Link href="/home" className="">
          {t('home')}
        </Link>
        <Link href="/collections" className="">
          {t('collections')}
        </Link>
        <Link href="/new" className="">
          {t('new')}
        </Link>
      </ul>
    </nav>
  );
};
export default Navigation;
