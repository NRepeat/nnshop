import Link from 'next/link';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@shared/ui/navigation-menu';
import { getLocale, getTranslations } from 'next-intl/server';

export const Subnavigation = async () => {
  // const t = await getTranslations('Header.subnav');

  return (
    <div className="w-full flex container px-3 py-4">
      <NavigationMenu>
        <NavigationMenuList className="">
          {/*{collections.map((collection) => (
            <NavigationMenuItem key={collection.name}>
              <Link href={collection.href}>
                <NavigationMenuTrigger className="font-medium">
                  {collection.name}
                </NavigationMenuTrigger>
              </Link>
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
          ))}*/}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};
