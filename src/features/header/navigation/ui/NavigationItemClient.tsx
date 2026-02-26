'use client';

import { Link } from '@shared/i18n/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, MouseEventHandler } from 'react';
import { cn } from '@shared/lib/utils';
import { useNavigationClose } from './NavigationClient';
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
  const closeMenu = useNavigationClose();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  useEffect(() => {
    if (pendingPath && pathname.includes(pendingPath)) {
      setPendingPath(null);
    }
  }, [pathname, pendingPath]);

  const normalizedHref = href.startsWith('/') ? href : `/${href}`;
  const isActive =
    pathname === normalizedHref || pendingPath === normalizedHref;
  const handleClick = (e: MouseEvent, href: string) => {
    setPendingPath(normalizedHref);
    closeMenu();
  };

  return (
    <Link
      href={href}
      prefetch
      onClick={(e) => handleClick(e as any as MouseEvent, href)}
      className={cn(
        'inline-block px-4 py-2 text-base font-300 font-sans border-none transition-colors',
        // isActive ? 'border-current' : 'border-transparent hover:border-current',
        className,
      )}
    >
      {children}
    </Link>
  );
};
