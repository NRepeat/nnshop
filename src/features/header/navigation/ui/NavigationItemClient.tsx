'use client';

import { Link } from '@shared/i18n/navigation';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@shared/lib/utils';

interface NavigationItemClientProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const NavigationItemClient = ({
  href,
  children,
  className,
}: NavigationItemClientProps) => {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Очищаем состояние pending когда pathname изменяется
  useEffect(() => {
    if (pendingPath && pathname.includes(pendingPath)) {
      setPendingPath(null);
    }
  }, [pathname, pendingPath]);

  // Проверяем активность: текущий путь или ожидающий переход
  const normalizedHref = href.startsWith('/') ? href : `/${href}`;
  const isActive = pathname === normalizedHref || pendingPath === normalizedHref;

  const handleClick = () => {
    // Мгновенно обновляем UI при клике
    setPendingPath(normalizedHref);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'inline-block px-4 py-2 text-base font-300 font-sans border-b transition-colors',
        isActive
          ? 'border-current'
          : 'border-transparent hover:border-current',
        className,
      )}
    >
      {children}
    </Link>
  );
};
