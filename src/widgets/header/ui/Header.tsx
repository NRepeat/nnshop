import { AccountButton } from '@features/header/account/ui/AccoutnButton';
import CartSheet from '@features/header/cart/ui/Sheet';
import Navigation from '@features/header/navigation/ui/Navigation';
import NavigationSheet from '@features/header/navigation/ui/Sheet';
import Logo from '@shared/assets/Logo';
import Link from 'next/link';

export const Header = async () => {
  return (
    <header className=" sticky top-2   z-20  backdrop-blur-sm bg-card/60 border-card border-2">
      <div className="grid grid-cols-3  container   ">
        <div className="flex  justify-start items-center  py-5 ">
          <NavigationSheet />
          <Navigation />
        </div>
        <div className="justify-items-center justify-center flex  py-5 ">
          <Link className="flex" href="/">
            <Logo className="w-10 h-10" />
          </Link>
        </div>
        <div className="justify-items-end flex gap-4 justify-end items-center  py-5 ">
          <AccountButton />
          <CartSheet />
        </div>
      </div>
    </header>
  );
};
