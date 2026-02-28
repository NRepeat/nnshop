
import { NavigationMenuTrigger } from '@shared/ui/navigation-menu';
import { cn } from '@shared/lib/utils';

interface NavigationTriggerClientProps {
  children: React.ReactNode;
  className?: string;
}

export const NavigationTriggerClient = ({
  children,
  className,
}: NavigationTriggerClientProps) => {
  return (
    <NavigationMenuTrigger
      variant={'ghost'}
      className={cn(
        'hover:bg-accent/50 hover:rounded-t  cursor-pointer w-full text-nowrap text-base font-300 font-sans h-full has-[>svg]:px-5 px-5 py-2 border-transparent',
        className,
      )}
    >
      {children}
    </NavigationMenuTrigger>
  );
};
