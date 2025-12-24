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
import Link from 'next/link';

export const CurrentNavigationSession = async () => {
  const locale = await getLocale();
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || 'woman';
  return <Navigation gender={gender} locale={locale} />;
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
        <ul className=" gap-4  bg-transparent flex container" key={index}>
          {item.items.map((subItem) => (
            <NavigationMenuItem
              key={subItem.url + subItem.title + gender}
              className="hover:underline"
            >
              <NavigationMenuTrigger
                variant={'ghost'}
                className="rounded-none  cursor-pointer w-full text-nowrap text-xs font-300 font-sans h-full px-5 py-1.5 "
              >
                {subItem.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-2 md:w-full lg:w-full md:grid-cols-[.75fr_1fr] lg:grid-cols-[.75fr_1fr]">
                  {subItem.items.map((subItem, index) => (
                    <li
                      key={subItem.title + gender}
                      className="w-[150px] row-span-3 ml-2"
                    >
                      <Button
                        variant={'ghost'}
                        className="w-full rounded-none justify-start bg-transparent hover:bg-transparent hover:underline "
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
    } else {
      return (
        <NavigationMenuItem
          key={item.title}
          className={` ${index === meinMenu.length - 1 ? 'hidden lg:block' : 'block'}`}
        >
          <Button
            className="rounded-none  cursor-pointer w-full text-nowrap text-md pl-0"
            variant={'ghost'}
          >
            <Link href={'/'}>{item.title}</Link>
          </Button>
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
