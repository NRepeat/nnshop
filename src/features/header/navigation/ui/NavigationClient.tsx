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
  const [isOpen, setOpen] = useState<boolean>(false);

  return (
    <NavigationMenu
      className="hidden md:block"
      onValueChange={(value) => setOpen(!!value)}
    >
      <div
        className={cn(
          'fixed inset-0  top-38  min-h-screen  transition-all duration-500 ease-in-out',
          'bg-foreground/40 backdrop-blur-[2px]',
          isOpen
            ? 'opacity-100 pointer-events-auto visible animate-in fade-in'
            : 'opacity-0 pointer-events-none invisible animate-out fade-out delay-150',
        )}
      />
      <NavigationMenuList className={cn(className)}>
        {children}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
