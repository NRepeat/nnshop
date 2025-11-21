import { VisualEditing } from 'next-sanity/visual-editing';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/shared/i18n/routing';
import { Header } from '@widgets/header/ui/Header';
import { SanityLive } from '@shared/sanity/lib/live';
import { DisableDraftMode } from '@shared/sanity/components/live/DisableDraftMode';
import { draftMode } from 'next/headers';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  return (
    <div>
      <Header />
      {children}
      <SanityLive />
      {(await draftMode()).isEnabled && (
        <>
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
    </div>
  );
}
