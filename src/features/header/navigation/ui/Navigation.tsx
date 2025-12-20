import { Link } from '@shared/i18n/navigation';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@shared/ui/navigation-menu';
import { Button } from '@shared/ui/button';
import { getMainMenu } from '../api/getMainMenu';
import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';

export const CurrentNavigationSession = async () => {
  const locale = await getLocale();
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || 'woman';
  return (
    <>
      <Navigation gender={gender} locale={locale} />
    </>
  );
};

const Navigation = async ({
  gender,
  locale,
}: {
  gender: string;
  locale: string;
}) => {
  'use cache';
  const meinMenu = await getMainMenu({ gender, locale });
  const menu = meinMenu.map((item, index) => {
    if (item.items.length > 0) {
      return (
        <ul className=" gap-4  bg-transparent flex">
          {item.items.map((subItem) => (
            <NavigationMenuItem key={subItem.title}>
              <NavigationMenuTrigger
                variant={'ghost'}
                className="rounded-none text-md"
              >
                {subItem.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-transparent w-full">
                <ul className="grid gap-2 md:w-[400px] lg:w-[500px] md:grid-cols-[.75fr_1fr] lg:grid-cols-[.75fr_1fr]">
                  {subItem.items.map((subItem) => (
                    <li
                      key={subItem.title}
                      className="w-[150px] row-span-3 ml-2"
                    >
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
          ))}
        </ul>
      );
      return (
        <NavigationMenuItem key={item.title}>
          <NavigationMenuTrigger
            variant={'ghost'}
            className="rounded-none text-md"
          >
            {item.title}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-transparent">
            <ul className="grid grid-cols-3 w-[750px] gap-4 bg-transparent">
              {item.items.map((subItem) => (
                <li key={subItem.title} className="w-full">
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
