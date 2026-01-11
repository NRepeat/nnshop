import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from '@shared/ui/navigation-menu';
import { Button } from '@shared/ui/button';
import { getMainMenu } from '../api/getMainMenu';
import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { NavigationClient } from './NavigationClient';
import { Skeleton } from '@shared/ui/skeleton';
import Image from 'next/image';

export const CurrentNavigationSession = async () => {
  const locale = await getLocale();
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || 'woman';
  return <Navigation gender={gender} locale={locale} />;
};

export const CurrentNavigationSessionSkilet = () => {
  const meinMenu = [
    { slug: 'home', title: 'Home', items: [] },
    { slug: 'about', title: 'About', items: [] },
  ];
  const menu = meinMenu.map((item, index) => {
    return (
      <NavigationMenuItem
        key={item.title}
        className={` ${index === meinMenu.length - 1 ? 'block' : 'block'}`}
      >
        <Skeleton className="w-[100px] h-[28px]" />
      </NavigationMenuItem>
    );
  });
  return (
    <NavigationClient className="bg-transparent flex container justify-start">
      {menu}
    </NavigationClient>
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
        <ul className="bg-transparent flex w-full justify-center" key={index}>
          {item.items.map((subItem) => (
            <NavigationMenuItem
              key={subItem.url + subItem.title + gender}
              className="hover:underline group"
            >
              <NavigationMenuTrigger
                variant={'ghost'}
                className="rounded-none  cursor-pointer w-full text-nowrap text-base font-300 font-sans h-full has-[>svg]:px-5  px-5 py-2"
              >
                {subItem.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="  flex  justify-between ">
                <div className="flex w-full  pt-7  min-w-[calc(100vw)] h-[350px] ">
                  <div className="container w-full flex justify-between">
                    <ul className="grid h-fit gap-2 md:w-lg lg:w-3xl md:grid-cols-[.75fr_1fr] lg:grid-cols-[.75fr_1fr] ">
                      {subItem.items.map((subItem) => (
                        <li
                          key={subItem.title + gender}
                          className="w-full row-span-3 ml-2 "
                        >
                          <Button
                            variant={'ghost'}
                            className="w-full rounded-none  justify-start bg-transparent hover:underline "
                          >
                            <Link
                              href={subItem.url}
                              className=" text-base font-300 font-sans "
                            >
                              {subItem.title}
                            </Link>
                          </Button>
                        </li>
                      ))}
                    </ul>
                    <div className="w-[300px] h-[300px] ">
                      <Image
                        src="/auth_image.jpeg"
                        alt={subItem.title}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
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
            className="w-full rounded-none justify-start bg-transparent hover:underline "
            variant={'ghost'}
          >
            <Link href={'/'}>{item.title}</Link>
          </Button>
        </NavigationMenuItem>
      );
    }
  });
  return <NavigationClient className=" pt-2 w-full">{menu}</NavigationClient>;
};
export default Navigation;
