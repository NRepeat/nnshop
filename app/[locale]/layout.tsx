import { routing } from '@/shared/i18n/routing';
import { Footer } from '@widgets/footer/ui/Footer';
import { SpeedInsights } from '@vercel/speed-insights/next';
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
      <Footer />
      <SpeedInsights />
    </div>
  );
}
