'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@shared/ui/input';
import { Button } from '@shared/ui/button';
import { X, Tag, Loader2, Check } from 'lucide-react';
import {
  applyDiscountCode,
  removeDiscountCode,
} from '@entities/cart/api/update-discount-codes';
import { useTranslations } from 'next-intl';
import { cn } from '@shared/lib/utils';

type DiscountCode = {
  code: string;
  applicable: boolean;
};

type DiscountCodeInputProps = {
  discountCodes?: DiscountCode[];
  className?: string;
};

export const DiscountCodeInput = ({
  discountCodes = [],
  className,
}: DiscountCodeInputProps) => {
  const t = useTranslations('CartPage');
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
    if (!code.trim()) return;

    setError(null);
    startTransition(async () => {
      const result = await applyDiscountCode(code.trim());
      if (result.success) {
        setCode('');
        if (result.applicable === false) {
          setError(t('invalid_code'));
        }
        router.refresh();
      } else {
        setError(result.error || t('invalid_code'));
      }
    });
  };

  const handleRemove = (codeToRemove: string) => {
    startTransition(async () => {
      await removeDiscountCode(codeToRemove);
      router.refresh();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('discount_code')}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            className="pl-10"
            disabled={isPending}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={isPending || !code.trim()}
          variant="outline"
          size="default"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t('apply')
          )}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {discountCodes.length > 0 && (
        <div className="space-y-2">
          {discountCodes.map((discount) => (
            <div
              key={discount.code}
              className={cn(
                'flex items-center justify-between rounded-md border px-3 py-2 text-sm',
                discount.applicable
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                  : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
              )}
            >
              <div className="flex items-center gap-2">
                {discount.applicable ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Tag className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                )}
                <span className="font-medium">{discount.code}</span>
                {!discount.applicable && (
                  <span className="text-xs text-muted-foreground">
                    ({t('invalid_code')})
                  </span>
                )}
              </div>
              <button
                onClick={() => handleRemove(discount.code)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={isPending}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
