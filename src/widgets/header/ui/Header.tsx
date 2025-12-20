import { AccountButton } from '@features/header/account/ui/AccoutnButton';
import CartSheet from '@features/header/cart/ui/Sheet';
import { LanguageSwitcher } from '@features/header/language-switcher/ui/LanguageSwitcher';
import Navigation from '@features/header/navigation/ui/Navigation';
import { PersistLinkNavigation } from '@features/header/navigation/ui/PersistLinkNavigation';
import NavigationSheet from '@features/header/navigation/ui/Sheet';
import Logo from '@shared/assets/Logo';
import Link from 'next/link';

export const Header = async () => {
  return (
    <header className=" sticky top-2   z-20  backdrop-blur-sm bg-card/60 border-card border-2">
      <div className="container">
        <div className="grid grid-cols-3  pt-2">
          <div className="flex  justify-start items-center  ">
            <NavigationSheet />
            <PersistLinkNavigation />
          </div>
          <div className="justify-items-center justify-center flex   ">
            <Link className="flex h-fit" href="/">
              <Logo className="w-10 h-10" />
            </Link>
          </div>
          <div className="justify-items-end flex gap-4 justify-end items-center  ">
            <LanguageSwitcher />
            <AccountButton />
            <CartSheet />
          </div>
        </div>
      </div>
      <div className="container">
        <div className="w-full flex flex-1  py-2">
          <Navigation />
        </div>
      </div>
    </header>
  );
};
