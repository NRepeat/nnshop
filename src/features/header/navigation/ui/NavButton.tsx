'use client';
import { Button } from '@shared/ui/button';
import {  cookieFenderSet } from '../api/setCookieGender';
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
  const onClick = async (gender: string) => {
    if (gender) {
      await cookieFenderSet(gender);
    }
  };

  return (
    <Button
      className={cn(
        'rounded-none w-full  cursor-pointer  text-nowrap md:text-base font-300 font-sans h-full border-b border-transparent px-6 text-lg md:px-5 md:py-2',
        {
          ' border-b-black': gender === slug,
        },
      )}
      variant={'ghost'}
      onClick={async () => await onClick(slug)}
    >
      {children}
    </Button>
  );
};
