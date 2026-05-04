'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createLoyaltyCard } from '@features/admin/bonuses/actions';
import { Input } from '@shared/ui/input';
import { Button } from '@shared/ui/button';

export function CreateCardForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await createLoyaltyCard(formData);
      if (!res.ok) {
        setError(res.error || 'Ошибка');
        return;
      }
      const form = document.getElementById(
        'create-card-form',
      ) as HTMLFormElement | null;
      form?.reset();
      if (res.cardId) {
        router.push(`/admin/bonuses/${res.cardId}`);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <form
      id="create-card-form"
      action={handleSubmit}
      className="grid gap-3 sm:grid-cols-[1fr_1fr_180px_auto] sm:items-end"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="create-phone" className="text-sm font-medium">
          Телефон
        </label>
        <Input
          id="create-phone"
          name="phone"
          type="tel"
          placeholder="+380991234567"
          required
          disabled={pending}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="create-name" className="text-sm font-medium">
          Имя
        </label>
        <Input
          id="create-name"
          name="name"
          type="text"
          placeholder="Иван Иванов"
          required
          disabled={pending}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="create-balance" className="text-sm font-medium">
          Начальный баланс
        </label>
        <Input
          id="create-balance"
          name="initialBalance"
          type="number"
          step="0.01"
          min="0"
          placeholder="0"
          disabled={pending}
        />
      </div>
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? 'Создаю…' : 'Создать карту'}
      </Button>
      {error && (
        <div className="sm:col-span-4 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
    </form>
  );
}
