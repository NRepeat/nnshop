'use client';

import { NavigationMenuTrigger } from '@shared/ui/navigation-menu';
import { cn } from '@shared/lib/utils';
import { useNavigationClose } from './NavigationClient';
import { useRouter } from '@shared/i18n/navigation';

interface NavigationTriggerClientProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
}

export const NavigationTriggerClient = ({
  children,
  className,
  href,
}: NavigationTriggerClientProps) => {
  const close = useNavigationClose();
  const router = useRouter();

  return (
    <NavigationMenuTrigger
      variant={'ghost'}
      className={cn(
        'hover:bg-accent/50 hover:rounded-t  cursor-pointer w-full text-nowrap text-base font-300 font-sans h-full has-[>svg]:px-5 px-5 py-2 border-transparent',
        className,
      )}
      onClick={(e) => {
        if (e.currentTarget.dataset.state === 'open') {
          close();
          if (href) router.push(href);
        }
      }}
    >
      {children}
    </NavigationMenuTrigger>
  );
};
