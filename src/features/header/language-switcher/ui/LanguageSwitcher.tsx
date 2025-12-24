'use client';

import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useTranslations } from 'use-intl';
import { setLocale } from '../api/set-locale';

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('Header.locale');
  const changeLocale = async (newLocale: string) => {
    await setLocale(newLocale);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <Button variant="ghost" size="icon" className="h-full ">
          <Globe />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-none">
        <DropdownMenuItem
          className="rounded-none"
          onClick={() => changeLocale('ru')}
        >
          {t('ru')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-none"
          onClick={() => changeLocale('uk')}
        >
          {t('uk')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
