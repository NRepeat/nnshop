import { Header } from '@widgets/header/ui/Header';
import { genders, locales } from '@shared/i18n/routing';
import { setRequestLocale } from 'next-intl/server';

export async function generateStaticParams() {
  const params = [];
  for (const gender of genders) {
    for (const locale of locales) {
      params.push({ locale: locale, gender: gender });
    }
  }
  return params;
}
interface RootProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; gender: string }>;
  auth?: React.ReactNode;
}

export default async function RootLayout(props: RootProps) {
  const { children, params, auth } = props;
  const { locale, gender } = await params;

  setRequestLocale(locale);
  return (
    <div>
      <Header locale={locale} gender={gender} />
      {children}
      {auth && <div id="auth-modal-slot">{auth}</div>}
    </div>
  );
}
