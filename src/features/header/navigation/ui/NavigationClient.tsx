'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { NavigationMenu, NavigationMenuList } from '@shared/ui/navigation-menu';
import { cn } from '@shared/lib/utils';

const NavigationCloseContext = createContext<() => void>(() => {});

export const useNavigationClose = () => useContext(NavigationCloseContext);

export const NavigationClient = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [value, setValue] = useState('');
  const close = useCallback(() => setValue(''), []);

  return (
    <NavigationCloseContext.Provider value={close}>
      <NavigationMenu
        value={value}
        onValueChange={setValue}
        skipDelayDuration={100}
        delayDuration={100}
        className="w-full navigation-menu-wrapper"
        viewport={true}
      >
        <NavigationMenuList
          className={cn(className, ' flex items-center justify-center grid-cols-3 md:grid-cols-3 w-full pt-0 py-2')}
        >
          {children}
        </NavigationMenuList>
      </NavigationMenu>
    </NavigationCloseContext.Provider>
  );
};
