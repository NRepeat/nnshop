'use client';

import { NavigationMenu, NavigationMenuList } from '@shared/ui/navigation-menu';
import { useState } from 'react';
import { cn } from '@shared/lib/utils';
import { Send } from 'lucide-react';
import { Button } from '@shared/ui/button';

export const NavigationClient = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  return (
    <NavigationMenu
      skipDelayDuration={100}
      delayDuration={100}
      className="w-full navigation-menu-wrapper"
      onValueChange={(value) => setOpen(!!value)}
    >
      <NavigationMenuList
        className={cn(className, 'flex items-center justify-center grid-cols-3 md:grid-cols-3 w-full pt-0 py-2')}
      >
        {children}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
