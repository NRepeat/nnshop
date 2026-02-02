'use client';

import { NavigationMenuTrigger } from '@shared/ui/navigation-menu';
import { usePathname } from 'next/navigation';
import { cn } from '@shared/lib/utils';
import { useEffect, useState } from 'react';

interface NavigationTriggerClientProps {
  children: React.ReactNode;
  urls: string[];
  className?: string;
}

export const NavigationTriggerClient = ({
  children,
  urls,
  className,
}: NavigationTriggerClientProps) => {
  const pathname = usePathname();
  const [isHovering, setIsHovering] = useState(false);

  // Нормализуем URL для сравнения
  const normalizedUrls = urls.map((url) =>
    url.startsWith('/') ? url : `/${url}`,
  );

  // Проверяем, находимся ли мы на одной из страниц в подменю
  const isActive = normalizedUrls.some(
    (url) => pathname === url || pathname.startsWith(`${url}/`),
  );

  return (
    <NavigationMenuTrigger
      variant={'ghost'}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        'cursor-pointer w-full text-nowrap text-base font-300 font-sans h-full has-[>svg]:px-5 px-5 py-2 hover:bg-accent/50 hover:border-none transition-colors',
        isActive && 'border-b border-current',
        className,
      )}
    >
      {children}
    </NavigationMenuTrigger>
  );
};
