import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
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
          <NavigationMenuTrigger variant={'ghost'} className="rounded-full">
            {item.title}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-transparent">
            <ul className="grid w-[250px] gap-4  bg-transparent">
              {item.items.map((subItem) => (
                <li key={subItem.title}>
                  <Button
                    variant={'ghost'}
                    className="w-full justify-start bg-transparent hover:bg-transparent hover:underline"
                  >
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
          className={` ${index === meinMenu.length - 1 ? 'hidden lg:block' : 'block'}`}
        >
          <Button
            className="rounded-full cursor-pointer w-full text-nowrap"
            variant={'ghost'}
          >
            {item.title}
          </Button>
          {/*<NavigationMenuLink
            className="cursor-pointer w-full text-nowrap "
            href=""
          >
            {item.title}
          </NavigationMenuLink>*/}
        </NavigationMenuItem>
      );
    }
  });
  return (
    <NavigationMenu className="hidden md:block ">
      <NavigationMenuList>{menu}</NavigationMenuList>
    </NavigationMenu>
  );
};
export default Navigation;
