'use client';

import { Link } from '@shared/i18n/navigation';
import { usePathname } from 'next/navigation';
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

  const normalizedHref = href.startsWith('/') ? href : `/${href}`;
  const isActive = pathname === normalizedHref;

  return (
    <Link
      href={href}
      prefetch
      onClick={closeMenu}
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
