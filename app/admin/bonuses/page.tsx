import { Suspense } from 'react';
import Link from 'next/link';
import { IconArrowRight, IconPlus, IconSearch } from '@tabler/icons-react';
import {
  searchLoyaltyCards,
  getTopCards,
} from '@features/admin/bonuses/actions';
import { SiteHeader } from '@/components/site-header';
import { ResultsCardSkeleton } from '../_skeletons';
import { CreateCardForm } from './CreateCardForm';
import { Input } from '@shared/ui/input';
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
import { Badge } from '@shared/ui/badge';

const balanceFmt = new Intl.NumberFormat('uk-UA', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

type Row = {
  id: string;
  name: string;
  phone: string;
  bonusBalance: number;
  isStub: boolean;
  userEmail: string | null;
};

function CardsTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-muted-foreground">
        Карты не найдены
      </div>
    );
  }

  return (
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
        {rows.map((card) => (
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
  );
}

async function SearchAndResults({ searchParams }: PageProps) {
  const { q = '' } = await searchParams;
  const trimmed = q.trim();
  const rows: Row[] = trimmed
    ? await searchLoyaltyCards(trimmed)
    : await getTopCards(50);

  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Найти карту</h2>
        <p className="text-sm text-muted-foreground">
          Введите телефон в любом формате (0991234567, +380991234567) или имя клиента
        </p>
        <form
          className="flex flex-wrap items-center gap-2 mt-2"
          action="/admin/bonuses"
        >
          <div className="relative flex-1 min-w-64 max-w-xl">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Телефон или имя"
              className="pl-9 h-10"
              aria-label="Поиск карты по телефону или имени"
            />
          </div>
          <Button type="submit" className="h-10">
            Найти
          </Button>
          {trimmed && (
            <Button type="button" variant="ghost" asChild className="h-10">
              <Link href="/admin/bonuses">Сбросить</Link>
            </Button>
          )}
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPlus className="size-5" />
            Создать карту
          </CardTitle>
          <CardDescription>
            Создаст карту с stub-пользователем. Если указан баланс &gt; 0 — добавится
            запись «Корректировка» с заметкой о начальном балансе.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateCardForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {trimmed ? `Результаты поиска: "${trimmed}"` : 'Топ карт по балансу'}
          </CardTitle>
          <CardDescription>
            {trimmed
              ? `Найдено: ${rows.length}`
              : 'Показаны 50 карт с наибольшим балансом. Используйте поиск для других карт.'}
          </CardDescription>
        </CardHeader>
        <CardsTable rows={rows} />
      </Card>
    </>
  );
}

export default function BonusesAdminPage({ searchParams }: PageProps) {
  return (
    <>
      <SiteHeader title="Бонусные карты" />
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <Suspense fallback={<ResultsCardSkeleton />}>
          <SearchAndResults searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
