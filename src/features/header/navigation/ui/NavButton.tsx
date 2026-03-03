'use client';
import { Button } from '@shared/ui/button';
import { cookieFenderSet } from '../api/setCookieGender';
import { cn } from '@shared/lib/utils';
import { usePathname } from '@shared/i18n/navigation';
import { genders } from '@shared/i18n/routing';

export const NavButton = ({
  children,
  gender,
  slug,
  className,
}: {
  slug: string;
  children?: React.ReactNode;
  gender?: string;
  className?: string;
}) => {
  const pathname = usePathname();

  const onClick = async (genderValue: string) => {
    if (genderValue) {
      await cookieFenderSet(genderValue);
    }
  };

  const genderInUrl = pathname.split('/').find((segment) => genders.includes(segment));
  const isActive = genderInUrl ? genderInUrl === slug : (gender || 'woman') === slug;

  return (
    <Button
      className={cn(
        'w-full cursor-pointer text-nowrap md:text-base font-300 font-sans h-full px-6 text-lg md:px-5 md:py-2    ',
        'border-b-2 border-transparent hover:bg-accent/50 hover:underline  duration-300 decoration-transparent hover:decoration-primary  transition-all',
        {
          'border-b-primary': isActive,
        },
        className,
      )}
      variant={'ghost'}
      onClick={async () => await onClick(slug)}
    >
      {children}
    </Button>
  );
};
