import Link from 'next/link';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@shared/ui/navigation-menu';
import { Button } from '@shared/ui/button';
import { getMainMenu } from '../api/getMainMenu';

const Navigation = async () => {
  const meinMenu = await getMainMenu();
  const menu = meinMenu.map((item, index) => {
    if (item.items.length > 0) {
      return (
        <NavigationMenuItem key={item.title}>
          <NavigationMenuTrigger
            variant={'ghost'}
            className="rounded-none text-md"
          >
            {item.title}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-transparent">
            <ul className="grid w-[250px] gap-4  bg-transparent">
              {item.items.map((subItem) => (
                <li key={subItem.title}>
                  <Button
                    variant={'ghost'}
                    className="w-full rounded-none justify-start bg-transparent hover:bg-transparent hover:underline"
                  >
                    <Link href={subItem.url} className="text-md">
                      {subItem.title}
                    </Link>
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
            className="rounded-none  cursor-pointer w-full text-nowrap text-md"
            variant={'ghost'}
          >
            <Link href={'/'}>{item.title}</Link>
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
