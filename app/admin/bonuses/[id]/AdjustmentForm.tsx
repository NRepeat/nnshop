'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adjustBonus } from '@features/admin/bonuses/actions';
import { Input } from '@shared/ui/input';
import { Textarea } from '@shared/ui/textarea';
import { Button } from '@shared/ui/button';

export function AdjustmentForm({ cardId }: { cardId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    formData.set('cardId', cardId);
    startTransition(async () => {
      const res = await adjustBonus(formData);
      if (!res.ok) {
        setError(res.error || 'Ошибка');
        return;
      }
      const form = document.getElementById(
        `adjust-form-${cardId}`,
      ) as HTMLFormElement | null;
      form?.reset();
      router.refresh();
    });
  };

  return (
    <form
      id={`adjust-form-${cardId}`}
      action={handleSubmit}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`amount-${cardId}`} className="text-sm font-medium">
          Сумма (+/-)
        </label>
        <Input
          id={`amount-${cardId}`}
          type="number"
          step="0.01"
          name="amount"
          placeholder="Например: 100 или -50"
          required
          disabled={pending}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`note-${cardId}`} className="text-sm font-medium">
          Заметка <span className="text-muted-foreground font-normal">(необязательно)</span>
        </label>
        <Textarea
          id={`note-${cardId}`}
          name="note"
          placeholder="Причина корректировки"
          disabled={pending}
          rows={3}
        />
      </div>
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Сохраняю…' : 'Применить'}
      </Button>
    </form>
  );
}
