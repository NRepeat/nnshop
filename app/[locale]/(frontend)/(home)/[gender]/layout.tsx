import { setRequestLocale } from 'next-intl/server';
import { SetGenderCookie } from '@features/header/navigation/ui/SetGenderCookie';

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string; gender: string }>;
}>) {
  const { locale, gender } = await params;

  setRequestLocale(locale);
  return (
    <div className="mb-20">
      <SetGenderCookie gender={gender} />
      {children}
    </div>
  );
}
