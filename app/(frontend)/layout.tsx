import { VisualEditing } from 'next-sanity/visual-editing';
import { routing } from '@/shared/i18n/routing';
import { Header } from '@widgets/header/ui/Header';
import { SanityLive } from '@shared/sanity/lib/live';
import { DisableDraftMode } from '@shared/sanity/components/live/DisableDraftMode';
import { draftMode } from 'next/headers';
import { Footer } from '@widgets/footer/ui/Footer';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mb-10">
      <Header />
      {children}
      <Suspense fallback={<div>Loading...</div>}>
        <SanityLive />
      </Suspense>
      {(await draftMode()).isEnabled && (
        <>
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
      <Footer />
      <SpeedInsights />
    </div>
  );
}
