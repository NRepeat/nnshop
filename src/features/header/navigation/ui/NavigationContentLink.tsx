'use client';

import { Link } from '@shared/i18n/navigation';

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
  return (
    <Link href={href} prefetch className={className}>
      {children}
    </Link>
  );
};
