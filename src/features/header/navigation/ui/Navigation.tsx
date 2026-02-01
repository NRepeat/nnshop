import React from 'react';
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from '@shared/ui/navigation-menu';
import { getMainMenu } from '../api/getMainMenu';
import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Link } from '@shared/i18n/navigation';
import { NavigationClient } from './NavigationClient';
import { Skeleton } from '@shared/ui/skeleton';

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

const genderSlugMap: Record<string, string[]> = {
  woman: ['woman', 'women', 'female', 'жен', 'женщин', 'жінк', 'zhinok', 'zhinoch'],
  man: ['man', 'men', 'male', 'муж', 'мужчин', 'чолов', 'cholovik'],
};

function matchesGender(
  item: { url: string; title: string },
  gender: string,
): boolean {
  const slug = item.url.split('/').pop()?.toLowerCase() || '';
  const title = item.title.toLowerCase();
  const slugs = genderSlugMap[gender] || [];
  return slugs.some((s) => slug.includes(s) || title.includes(s));
}

const Navigation = async ({
  gender,
  locale,
}: {
  gender: string;
  locale: string;
}) => {
  const allItems = await getMainMenu({ locale });
  console.log('🚀 ~ Navigation ~ allItems:', JSON.stringify(allItems, null, 2));
  const meinMenu = allItems.filter((item) => matchesGender(item, gender));

  // Fallback: if no match found, show first item
  const items = meinMenu.length > 0 ? meinMenu : allItems.slice(0, 1);

  const menu = items.map((item, index) => {
    if (item.items.length > 0) {
      return (
        <React.Fragment key={index}>
          {item.items.map((subItem) => (
            <NavigationMenuItem
              key={subItem.url + subItem.title + gender}
              className="hover:underline group"
            >
              <NavigationMenuTrigger
                variant={'ghost'}
                className="rounded-none cursor-pointer w-full text-nowrap text-base font-300 font-sans h-full has-[>svg]:px-5 px-5 py-2"
              >
                {subItem.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="flex justify-between !p-0">
                      {/* <div className="w-full row-span-3 ml-2">
                          <Link
                            href={subItem.url}
                            className="text-base font-300 font-sans w-full inline-block px-4 py-2 hover:underline font-medium"
                          >
                            {subItem.title}
                                       {console.log(subItem,"subItem")}
                            asd
                          </Link>
                      </div> */}
                <div className="flex w-full">
                  <div className="container w-full flex justify-between">
                    <ul className="grid h-fit gap-2 md:w-lg lg:w-3xl md:grid-cols-[.75fr_1fr] lg:grid-cols-[.75fr_1fr]">
                      {/* <li className="w-full row-span-3 ml-2">
                          <Link
                            href={subItem.url}
                            className="text-base font-300 font-sans w-full inline-block px-4 py-2 hover:underline font-medium"
                          >
                            {subItem.title}
                          </Link>
                      </li> */}
                      {subItem.items.map((child) => (
                        <li
                          key={child.title + gender}
                          className="w-full row-span-3 ml-2"
                        >
                            <Link
                              href={child.url}
                              className="text-base font-300 font-sans w-full inline-block px-4 py-2 hover:underline"
                            >
                              {child.title}
                            </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </React.Fragment>
      );
    } else {
      return (
        <NavigationMenuItem
          key={item.title}
          className={` ${index === items.length - 1 ? 'hidden lg:block' : 'block'}`}
        >
          <NavigationMenuLink asChild>
            <Link
              href={item.url}
              className="inline-block px-4 py-2 text-base font-300 font-sans hover:underline"
            >
              {item.title}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      );
    }
  });
  return <NavigationClient className=" pt-2 w-full">{menu}</NavigationClient>;
};
export default Navigation;
