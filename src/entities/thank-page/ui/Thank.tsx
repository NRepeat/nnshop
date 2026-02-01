import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { Link } from '@shared/i18n/navigation';import { getTranslations } from 'next-intl/server';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';

export const Thank = async ({
  orderId,
  locale,
}: {
  orderId: string;
  locale: string;
}) => {
  const t = await getTranslations({ locale, namespace: 'ThankYouPage' });

  const session = auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error('Unauthorized');
  }
  return (
    <div className="flex justify-center dark:bg-gray-900">
      <Card className="w-full max-w-full p-4 sm:p-4 shadow-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{t('title')}</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            {t('order_confirmation')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('order_id')}
            </p>
            <p className="text-lg font-medium">{orderId}</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('order_confirmation_text')}
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">{t('continue_shopping')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
