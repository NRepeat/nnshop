'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { authClient } from '@features/auth/lib/auth-client';
import { subscribeToPriceChanges } from '../api/subscribe-price';
import { Bell } from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopifyProductId: string;
  shopifyVariantId?: string;
};

export function PriceSubscribeModal({
  open,
  onOpenChange,
  shopifyProductId,
  shopifyVariantId,
}: Props) {
  const t = useTranslations('ProductPage');
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session?.user?.email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await subscribeToPriceChanges({
        email,
        shopifyProductId,
        shopifyVariantId,
      });
      if (result.success) {
        toast.success(t('priceSubscribeSuccess'));
        onOpenChange(false);
      } else {
        toast.error(result.error ?? t('priceSubscribeError'));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('priceSubscribeTitle')}
          </DialogTitle>
          <DialogDescription>{t('priceSubscribeDesc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <Input
            type="email"
            placeholder={t('priceSubscribeEmailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending || !email}>
            {isPending ? t('priceSubscribing') : t('priceSubscribeSubmit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
