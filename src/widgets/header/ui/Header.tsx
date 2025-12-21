import { CurrentNavigationSession } from '@features/header/navigation/ui/Navigation';
import { PersistLinkNavigation } from '@features/header/navigation/ui/PersistLinkNavigation';
import NavigationSheet from '@features/header/navigation/ui/Sheet';
import Logo from '@shared/assets/Logo';
import Link from 'next/link';
import { Suspense } from 'react';

export const Header = async () => {
  return (
    <header className=" sticky top-0  z-20  backdrop-blur-sm bg-card/60 border-b-2 border-b-muted">
      <div className="container">
        <div className="grid grid-cols-3  pt-2">
          <div className="flex  justify-start items-center  ">
            <Suspense fallback={<div>Loading...</div>}>
              <NavigationSheet />
              <PersistLinkNavigation />
            </Suspense>
          </div>
          <div className="justify-items-center justify-center flex   ">
            <Link className="flex h-fit" href="/">
              <Logo className="w-10 h-10" />
            </Link>
          </div>
          <div className="justify-items-end flex gap-4 justify-end items-center  ">
            {/*<LanguageSwitcher />*/}
            {/*<AccountButton />*/}
            {/*<CartSheet />*/}
          </div>
        </div>
      </div>
      <div className="container">
        <div className="w-full flex flex-1  py-2">
          <Suspense fallback={<div>Loading...</div>}>
            <CurrentNavigationSession />
          </Suspense>
        </div>
      </div>
    </header>
  );
};
