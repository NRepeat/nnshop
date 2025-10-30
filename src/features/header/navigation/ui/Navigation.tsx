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
  // const t = await getTranslations('Header.nav');
  const meinMenu = await getMainMenu();
  const menu = meinMenu.map((item, index) => {
    if (item.items.length > 0) {
      return (
        <NavigationMenuItem key={item.title}>
          <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[250px] gap-4">
              {item.items.map((subItem) => (
                <li key={subItem.title}>
                  <Button variant={'ghost'} className="w-full justify-start">
                    <Link href={subItem.url}>{subItem.title}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      );
    } else {
      return (
        <NavigationMenuItem
          key={item.title}
          className={`${index === meinMenu.length - 1 ? 'hidden lg:block' : 'block'}`}
        >
          <NavigationMenuLink
            className="cursor-pointer w-full text-nowrap"
            href=""
          >
            {item.title}
          </NavigationMenuLink>
        </NavigationMenuItem>
      );
    }
  });
  return (
    <NavigationMenu className="hidden md:block">
      <NavigationMenuList>{menu}</NavigationMenuList>
    </NavigationMenu>
  );
};
export default Navigation;
