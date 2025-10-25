import CartSheet from '@features/header/cart/ui/Sheet';
import Navigation from '@features/header/navigation/ui/Navigation';
import NavigationSheet from '@features/header/navigation/ui/Sheet';
import Logo from '@shared/assets/Logo';

export const Header = async () => {
  return (
    <header className="container py-6">
      <div className="grid grid-cols-3">
        <div className="flex gap-4 ">
          <NavigationSheet />
          <Navigation />
        </div>
        <div className="justify-items-center">
          <Logo className="w-10 h-10" />
        </div>
        <div className="justify-items-end">
          <CartSheet />
        </div>
      </div>
    </header>
  );
};
