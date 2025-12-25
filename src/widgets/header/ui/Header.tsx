import { AnnouncementBar } from '@entities/announcement-bar/announcement-bar';
import { AccountButton } from '@features/header/account/ui/AccoutnButton';
import CartSheet from '@features/header/cart/ui/Sheet';
import { LanguageSwitcherSession } from '@features/header/language-switcher/ui/LanguageSwitcherSession';
import {
  CurrentNavigationSession,
  CurrentNavigationSessionSkilet,
} from '@features/header/navigation/ui/Navigation';
import { PersistLinkNavigation } from '@features/header/navigation/ui/PersistLinkNavigation';
import NavigationSheet from '@features/header/navigation/ui/Sheet';
import Logo from '@shared/assets/Logo';
import { Button } from '@shared/ui/button';
import { Heart, Menu, Search, ShoppingCart, User2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export const Header = async () => {
  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0  z-30  bg-background ">
        <div className="container ">
          <div className="grid grid-cols-3 md:grid-cols-2  pt-5">
            <div className="col-span-1 hidden justify-start gap-4 md:flex">
              <Link className="flex h-fit" href="/">
                <Logo className="w-10 h-10" />
              </Link>
              <div className="w-fit flex gap-0.5">
                <PersistLinkNavigation />
              </div>
            </div>
            <Suspense
              fallback={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full  flex md:hidden"
                >
                  <Menu className="min-w-5 min-h-5" />
                </Button>
              }
            >
              <NavigationSheet />
            </Suspense>
            <div className="col-span-1 flex justify-center gap-1 md:hidden">
              <Link className="flex h-fit" href="/">
                <Logo className="w-10 h-10" />
              </Link>
            </div>
            <div className="col-span-1 flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-full">
                <Search />
              </Button>
              <Suspense
                fallback={
                  <Button variant="ghost" size="icon" className="h-full ">
                    <Heart />
                  </Button>
                }
              >
                <Button variant="ghost" size="icon" className="h-full ">
                  <Heart />
                </Button>
              </Suspense>

              <LanguageSwitcherSession className="hidden md:flex" />
              <Suspense
                fallback={
                  <Button variant="ghost" size="icon" className="h-full ">
                    <User2 />
                  </Button>
                }
              >
                <AccountButton className="hidden md:flex h-full" />
              </Suspense>
              <Suspense
                fallback={
                  <Button variant="ghost" size="icon" className="h-full">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                }
              >
                <CartSheet />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="w-full ">
          <div className="w-full flex flex-1  py-3">
            <Suspense fallback={<CurrentNavigationSessionSkilet />}>
              <CurrentNavigationSession />
            </Suspense>
          </div>
        </div>
      </header>
    </>
  );
};
