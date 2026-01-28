'use client';
import { Button } from '@shared/ui/button';
import { cookieFenderSet } from '../api/setCookieGender';
import { cn } from '@shared/lib/utils';

export const NavButton = ({
  children,
  gender,
  slug,
}: {
  slug: string;
  children?: React.ReactNode;
  gender?: string;
}) => {
  const onClick = async (genderValue: string) => {
    if (genderValue) {
      await cookieFenderSet(genderValue);
    }
  };

  // Default to 'woman' when gender is undefined
  const activeGender = gender || 'woman';
  const isActive = activeGender === slug;

  return (
    <Button
      className={cn(
        'rounded-none w-full cursor-pointer text-nowrap md:text-base font-300 font-sans h-full px-6 text-lg md:px-5 md:py-2',
        'border-b-2 border-transparent transition-colors duration-200',
        {
          'border-b-foreground': isActive,
        },
      )}
      variant={'ghost'}
      onClick={async () => await onClick(slug)}
    >
      {children}
    </Button>
  );
};
