'use client';

import { NavigationMenu, NavigationMenuList } from '@shared/ui/navigation-menu';
import { cn } from '@shared/lib/utils';

export const NavigationClient = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {

  return (
    <NavigationMenu
      skipDelayDuration={100}
      delayDuration={100}
      
      className="w-full navigation-menu-wrapper"
      viewport={true}
    >
      <NavigationMenuList
      
        className={cn(className, 'container flex items-center justify-center grid-cols-3 md:grid-cols-3 w-full pt-0 py-2')}
      >
        {children}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
