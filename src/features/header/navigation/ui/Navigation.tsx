import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@shared/ui/navigation-menu';
import { Button } from '@shared/ui/button';
import { getMainMenu } from '../api/getMainMenu';

const Navigation = async () => {
  const t = await getTranslations('Header.nav');
  const d = await getMainMenu();

  const collections: { title: string; href: string }[] = [
    {
      title: t('collections.forMan.title'),
      href: '/men',
    },
    {
      title: t('collections.forWoman.title'),
      href: '/women',
    },
  ];
  return (
    <NavigationMenu className="hidden sm:block">
      <NavigationMenuList className="">
        <NavigationMenuItem className="">
          <NavigationMenuTrigger>
            {t('collections.title')}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              {collections.map((collection) => (
                <li key={collection.title}>
                  <NavigationMenuLink asChild>
                    <Link href={collection.href}>
                      <div className="font-medium">{collection.title}</div>
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="">
          <NavigationMenuLink asChild>
            <Button variant="ghost">
              <Link href="/">{t('new')}</Link>
            </Button>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
export default Navigation;
