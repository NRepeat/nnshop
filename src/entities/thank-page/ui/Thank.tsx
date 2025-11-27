import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';

export const Thank = async ({ orderId }: { orderId: string }) => {
  const t = await getTranslations('ThankYouPage');

  const session = auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error('Unauthorized');
  }
  return (
    <div className="flex items-center justify-center dark:bg-gray-900">
      <Card className="w-full max-w-full p-6 sm:p-8 shadow-none">
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
