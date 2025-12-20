import { Locale, locales } from '@/shared/i18n/routing';

type RouteProps = {
  params: Promise<{ locale: Locale }>;
};
export const revalidate = 60;
export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale,
  }));
}

export default async function Page({ params }: RouteProps) {
  // const locale = await getLocale();
  // const cookie = await cookies();
  // const gender = cookie.get('gender')?.value || 'woman';
  return <div></div>;
}
