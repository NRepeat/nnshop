import { VisualEditing } from 'next-sanity/visual-editing';
import { Header } from '@widgets/header/ui/Header';
import { SanityLive } from '@shared/sanity/lib/live';
import { DisableDraftMode } from '@shared/sanity/components/live/DisableDraftMode';
import { draftMode } from 'next/headers';
import { Footer } from '@widgets/footer/ui/Footer';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <div className="">
      <Header locale={'en'} />
      {modal}
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
      <Footer locale={'en'} />
      <SpeedInsights />
    </div>
  );
}
