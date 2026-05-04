import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconCoin,
  IconPhone,
  IconMail,
  IconCalendar,
  IconUser,
} from '@tabler/icons-react';
import { getCardDetail } from '@features/admin/bonuses/actions';
import { AdjustmentForm } from './AdjustmentForm';
import { SiteHeader } from '@/components/site-header';
import { CardDetailSkeleton } from '../../_skeletons';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import {
  Card,
  CardContent,
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

interface PageProps {
  params: Promise<{ id: string }>;
}

const balanceFmt = new Intl.NumberFormat('uk-UA', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const TYPE_LABEL: Record<string, string> = {
  ACCRUAL: 'Начисление',
  SPEND: 'Списание',
  EXPIRY: 'Сгорание',
  ADJUSTMENT: 'Корректировка',
};

const TYPE_VARIANT: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  ACCRUAL: 'default',
  SPEND: 'outline',
  EXPIRY: 'destructive',
  ADJUSTMENT: 'secondary',
};

async function CardDetail({ params }: PageProps) {
  const { id } = await params;
  const card = await getCardDetail(id);
  if (!card) notFound();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl">{card.name}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 font-mono">
                  <IconPhone className="size-4" />
                  {card.phone}
                </span>
                {card.userEmail && (
                  <span className="flex items-center gap-1.5">
                    <IconMail className="size-4" />
                    {card.userEmail}
                  </span>
                )}
              </CardDescription>
            </div>
            {card.isStub ? (
              <Badge variant="secondary">Stub (не активирован)</Badge>
            ) : (
              <Badge>Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <IconCoin className="size-8 text-muted-foreground" />
            <div>
              <div className="text-4xl font-semibold tabular-nums">
                {balanceFmt.format(card.bonusBalance)}
              </div>
              <div className="text-sm text-muted-foreground">текущий баланс бонусов</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Корректировка баланса</CardTitle>
            <CardDescription>
              Положительная сумма — начислить, отрицательная — списать. Запись
              сохранится в истории движения.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdjustmentForm cardId={card.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>История движения</CardTitle>
            <CardDescription>
              Все начисления, списания и корректировки. Всего записей:{' '}
              {card.movements.length}.
            </CardDescription>
          </CardHeader>
          {card.movements.length === 0 ? (
            <CardContent>
              <div className="py-6 text-center text-sm text-muted-foreground">
                Движений нет
              </div>
            </CardContent>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <span className="flex items-center gap-1.5">
                      <IconCalendar className="size-4" />
                      Дата
                    </span>
                  </TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead>Заметка</TableHead>
                  <TableHead>
                    <span className="flex items-center gap-1.5">
                      <IconUser className="size-4" />
                      Кто
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {card.movements.map((m) => {
                  const displayAmount =
                    m.type === 'SPEND' || m.type === 'EXPIRY'
                      ? -Math.abs(m.amount)
                      : m.amount;
                  return (
                  <TableRow key={m.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {new Date(m.date).toLocaleString('uk-UA', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={TYPE_VARIANT[m.type] ?? 'secondary'}>
                        {TYPE_LABEL[m.type] ?? m.type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono tabular-nums ${displayAmount < 0 ? 'text-red-600' : 'text-green-700 dark:text-green-500'}`}
                    >
                      {displayAmount > 0 ? '+' : ''}
                      {balanceFmt.format(displayAmount)}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {m.note ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {m.actorEmail ?? '—'}
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}

export default function CardDetailPage({ params }: PageProps) {
  return (
    <>
      <SiteHeader title="Карта" />
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/bonuses">
              <IconArrowLeft className="size-4" />
              Все карты
            </Link>
          </Button>
        </div>
        <Suspense fallback={<CardDetailSkeleton />}>
          <CardDetail params={params} />
        </Suspense>
      </div>
    </>
  );
}
