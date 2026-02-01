'use client';

import { NavigationMenu, NavigationMenuList } from '@shared/ui/navigation-menu';
import { useState } from 'react';
import { cn } from '@shared/lib/utils';

export const NavigationClient = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [isOpen, setOpen] = useState<boolean>(true);

  return (
    <NavigationMenu
      skipDelayDuration={100}
      delayDuration={100}
      
      className="w-full navigation-menu-wrapper"
      // onValueChange={(value) => setOpen(!!value)}
      viewport={true}
    >
      {/* {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[-1] transition-opacity duration-300"
          aria-hidden="true"
        />
      )} */}
      <NavigationMenuList
      
        className={cn(className, 'container flex items-center justify-center grid-cols-3 md:grid-cols-3 w-full pt-0 py-2')}
      >
        {children}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
