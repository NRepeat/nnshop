'use client';
import { Button } from '@shared/ui/button';
import { cookieFenderSet } from '../api/setCookieGender';
import { cn } from '@shared/lib/utils';
import { Link } from '@shared/i18n/navigation';

export const NavButton = ({
  children,
  gender,
  slug,
}: {
  slug: string;
  children?: React.ReactNode;
  gender?: string;
}) => {
  // const onClick = async (genderValue: string) => {
  //   if (genderValue) {
  //     await cookieFenderSet(genderValue);
  //   }
  // };

  const activeGender = gender || 'woman';
  const isActive = activeGender === slug;

  return (
    <Link href={'/' + slug}>
      <Button
        className={cn(
          'w-full cursor-pointer text-nowrap md:text-base font-300 font-sans h-full px-6 text-lg md:px-5 md:py-2',
          'border-b-2 border-transparent transition-colors duration-200 hover:bg-accent/50',
          {
            'border-b-foreground': isActive,
          },
        )}
        variant={'ghost'}
        // onClick={async () => await onClick(slug)}
      >
        {children}
      </Button>
    </Link>
  );
};
