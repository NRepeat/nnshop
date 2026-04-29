import { Suspense } from 'react';
import Link from 'next/link';
import {
  IconCreditCard,
  IconUserCheck,
  IconUserExclamation,
  IconCoin,
  IconActivity,
  IconArrowRight,
} from '@tabler/icons-react';
import {
  getDashboardStats,
  getTopCards,
} from '@features/admin/bonuses/actions';
import { SiteHeader } from '@/components/site-header';
import { DashboardSkeleton } from './_skeletons';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/table';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';

const numberFmt = new Intl.NumberFormat('uk-UA', {
  maximumFractionDigits: 0,
});

const balanceFmt = new Intl.NumberFormat('uk-UA', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

async function DashboardContent() {
  const [stats, topCards] = await Promise.all([
    getDashboardStats(),
    getTopCards(10),
  ]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconCreditCard className="size-4" />
              Всего карт
            </CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {numberFmt.format(stats.totalCards)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconUserCheck className="size-4" />
              Зарегистрированы
            </CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {numberFmt.format(stats.registeredCards)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconUserExclamation className="size-4" />
              Stub-карты
            </CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {numberFmt.format(stats.stubCards)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconCoin className="size-4" />
              Сумма балансов
            </CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {balanceFmt.format(stats.totalBalance)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Топ карт по балансу</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <IconActivity className="size-4" />
              Движений за 30 дней:{' '}
              {numberFmt.format(stats.recentMovements30d)}
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/bonuses">
              Все карты
              <IconArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead className="text-right">Баланс</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topCards.map((card) => (
              <TableRow key={card.id}>
                <TableCell className="font-medium">{card.name}</TableCell>
                <TableCell className="font-mono text-sm">{card.phone}</TableCell>
                <TableCell className="text-right font-mono">
                  {balanceFmt.format(card.bonusBalance)}
                </TableCell>
                <TableCell>
                  {card.isStub ? (
                    <Badge variant="secondary">Stub</Badge>
                  ) : (
                    <Badge>Active</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {card.userEmail ?? '—'}
                </TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/admin/bonuses/${card.id}`}>
                      <IconArrowRight className="size-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <>
      <SiteHeader title="Дашборд" />
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </>
  );
}
