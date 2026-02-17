'use client';

import { Link } from '@shared/i18n/navigation';
import { useNavigationClose } from './NavigationClient';

interface NavigationContentLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const NavigationContentLink = ({
  href,
  children,
  className,
}: NavigationContentLinkProps) => {
  const closeMenu = useNavigationClose();

  return (
    <Link href={href} prefetch onClick={closeMenu} className={className}>
      {children}
    </Link>
  );
};
