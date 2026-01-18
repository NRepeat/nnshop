'use client';
import { Button } from '@shared/ui/button';
import { cookieFenderGet, cookieFenderSet } from '../api/setCookieGender';
import { useEffect, useState } from 'react';
import { cn } from '@shared/lib/utils';

export const NavButton = ({
  children,
  gender,
}: {
  children?: React.ReactNode;
  gender?: string;
}) => {
  const [currentGender, setCurrentGender] = useState<string | undefined>('');
  const onClick = async () => {
    if (gender) {
      console.log('gender', gender);
      await cookieFenderSet(gender);
    }
  };
  useEffect(() => {
    const getGender = async () => {
      const gender = await cookieFenderGet();
      if (gender) {
        setCurrentGender(gender);
      }
    };
    getGender();
  }, [gender]);
  return (
    <Button
      className={cn(
        'rounded-none w-full  cursor-pointer  text-nowrap md:text-base font-300 font-sans h-full border-b border-transparent px-6 text-lg md:px-5 md:py-2',
        {
          ' border-b-black': currentGender === gender,
        },
      )}
      variant={'ghost'}
      onClick={async () => await onClick()}
    >
      {children}
    </Button>
  );
};
