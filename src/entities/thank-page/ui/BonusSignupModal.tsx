'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Coins } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { Link } from '@shared/i18n/navigation';

type Props = {
  potentialBonus: number;
  currency: string;
  signUpHref?: string;
  signInHref?: string;
};

export function BonusSignupModal({
  potentialBonus,
  currency,
  signUpHref = '/auth/sign-up',
  signInHref = '/auth/sign-in',
}: Props) {
  const t = useTranslations('ThankYouPage.bonusSignup');
  const [open, setOpen] = useState(true);

  if (potentialBonus <= 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div className="flex flex-col items-center gap-2 bg-primary/10 px-6 py-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Coins className="size-6" />
          </div>
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="text-lg font-semibold">
              {t('title', {
                amount: potentialBonus,
                currency,
              })}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {t('description')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 text-sm text-gray-700">
          <ul className="space-y-1.5 list-disc list-inside">
            <li>{t('bullet_save')}</li>
            <li>{t('bullet_track')}</li>
            <li>{t('bullet_history')}</li>
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 px-6 pb-6 sm:flex-col">
          <Button
            asChild
            className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href={signUpHref}>{t('cta_signup')}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full h-10"
          >
            <Link href={signInHref}>{t('cta_login')}</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full h-10"
            onClick={() => setOpen(false)}
          >
            {t('cta_skip')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
