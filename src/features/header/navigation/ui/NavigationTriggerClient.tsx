
import { NavigationMenuTrigger } from '@shared/ui/navigation-menu';
import { cn } from '@shared/lib/utils';

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
  return (
    <NavigationMenuTrigger
      variant={'ghost'}
      className={cn(
        'cursor-pointer w-full text-nowrap text-base font-300 font-sans h-full has-[>svg]:px-5 px-5 py-2 hover:bg-accent/50 border-b border-transparent',
        className,
      )}
    >
      {children}
    </NavigationMenuTrigger>
  );
};
