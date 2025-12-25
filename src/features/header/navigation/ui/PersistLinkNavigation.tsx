'use client';
import { Button } from '@shared/ui/button';
import { NavigationMenuItem } from '@shared/ui/navigation-menu';
import { cookieFenderSet } from '../api/setCookieGender';
import { useTranslations } from 'next-intl';

export const PersistLinkNavigation = () => {
  const links = [
    { name: 'Жінки', slug: 'woman' },
    { name: 'Чоловіки', slug: 'man' },
    { name: 'Нові надходження', slug: 'new' },
  ];
  const t = useTranslations('Header.nav');
  return (
    <div className=" justify-center hidden md:flex">
      {links.map((link) => (
        <NavigationMenuItem key={link.slug} className={`flex p-0`}>
          <Button
            className="rounded-none  cursor-pointer w-full text-nowrap text-base font-300 font-sans h-full px-5 py-1.5"
            variant={'ghost'}
            onClick={() => cookieFenderSet(link.slug)}
          >
            {t(link.slug)}
          </Button>
        </NavigationMenuItem>
      ))}
    </div>
  );
};
