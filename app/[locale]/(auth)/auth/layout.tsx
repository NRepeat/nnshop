import { routing } from '@/shared/i18n/routing';
import Logo from '@shared/assets/Logo';
import Link from 'next/link';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className=" sticky top-2    z-20  backdrop-blur-sm bg-card/60 border-card border-2">
        <div className="flex justify-center items-center  container  ">
          <div className="justify-items-center justify-center flex  py-1">
            <Link className="flex" href="/">
              <Logo className="w-10 h-10" />
            </Link>
          </div>
        </div>
      </header>
      <div className=" flex-col items-center justify-center flex w-full">
        {children}
      </div>
    </>
  );
}
