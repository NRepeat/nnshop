import { Button } from '@shared/ui/button';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@shared/i18n/navigation';
export default async function NotFoundPage() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'NotFound' });

  return (
    <div className="container mx-auto flex h-[calc(100vh-200px)] items-center justify-center text-center">
      <div>
        <h1 className="text-9xl font-bold text-primary">{t('errorCode')}</h1>
        <h2 className="mt-4 text-3xl font-semibold">{t('title')}</h2>
        <p className="mt-2 text-lg text-muted-foreground">{t('description')}</p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">{t('goHome')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
