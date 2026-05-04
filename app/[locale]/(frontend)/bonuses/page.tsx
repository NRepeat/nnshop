import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { Breadcrumbs } from '@shared/ui/breadcrumbs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { locales } from '@shared/i18n/routing';
import { Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';
import { Skeleton } from '@shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/table';

function BonusesPageSkeleton() {
  return (
    <div className="container">
      <div className="flex flex-col gap-4 md:gap-8 mt-8">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-40" />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-36" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-3/6" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    params.push({ locale: locale });
  }
  return params;
}

export default async function BonusesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <div className="h-fit min-h-screen">
      <Suspense fallback={<BonusesPageSkeleton />}>
        <BonusesPageContent params={params} />
      </Suspense>
    </div>
  );
}

const BonusesPageContent = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const tHeader = await getTranslations({ locale, namespace: 'Header.nav' });
  const t = await getTranslations({ locale, namespace: 'BonusesPage' });
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    redirect('/auth/sign-in');
  }

  const loyaltyCard = await prisma.loyaltyCards.findFirst({
    where: { userId: session.user.id },
    include: {
      bonus_movements: {
        orderBy: { date: 'desc' },
      },
    },
  });

  const breadcrumbItems = [
    { label: tHeader('home'), href: '/' },
    { label: t('title'), href: '/bonuses', isCurrent: true },
  ];

  const balance = loyaltyCard?.bonusBalance || 0;
  const movements = loyaltyCard?.bonus_movements || [];

  return (
    <div className="container">
      <div className="flex flex-col gap-4 md:gap-8 mt-8">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-2xl font-bold">{t('title')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  {t('current_balance')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {balance > 0 ? `${balance} UAH` : t('empty_balance')}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('history_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                {movements.length === 0 ? (
                  <p className="text-muted-foreground">{t('empty_history')}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('table_date')}</TableHead>
                        <TableHead>{t('table_type')}</TableHead>
                        <TableHead className="text-right">{t('table_amount')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {new Date(movement.date).toLocaleDateString(locale, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                movement.type === 'ACCRUAL'
                                  ? 'bg-green-100 text-green-800'
                                  : movement.type === 'SPEND'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {t(`type_${movement.type}`)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {(() => {
                              const display =
                                movement.type === 'SPEND' ||
                                movement.type === 'EXPIRY'
                                  ? -Math.abs(movement.amount)
                                  : movement.amount;
                              return `${display > 0 ? '+' : ''}${display} UAH`;
                            })()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
