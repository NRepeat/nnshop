import { AccountButton } from '@features/header/account/ui/AccoutnButton';
import CartSheet from '@features/header/cart/ui/Sheet';
import Navigation from '@features/header/navigation/ui/Navigation';
import NavigationSheet from '@features/header/navigation/ui/Sheet';
import { Subnavigation } from '@features/header/navigation/ui/Subnavigation';
import Logo from '@shared/assets/Logo';

export const Header = async () => {
  return (
    <header className=" py-6">
      <div className="grid grid-cols-3 container">
        <div className="flex  justify-start items-center">
          <NavigationSheet />
          <Navigation />
        </div>
        <div className="justify-items-center">
          <Logo className="w-10 h-10" />
        </div>
        <div className="justify-items-end flex gap-4 justify-end items-center">
          <AccountButton />
          <CartSheet />
        </div>
      </div>
      <Subnavigation />
    </header>
  );
};
