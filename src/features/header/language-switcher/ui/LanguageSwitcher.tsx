'use client';

import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { useTranslations } from 'use-intl';
import { usePathname, useRouter } from '@shared/i18n/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@shared/lib/utils';
import { usePathStore } from '@/shared/store/use-path-store';
export const parseLocale = {
  ru: 'РУС',
  uk: 'УКР',
};
export function LanguageSwitcher({
  className,
  align,
  locale,
  side,
}: {
  locale?: string;
  className?: string;
  align?: 'center' | 'start' | 'end' | undefined;
  side?: 'top' | 'right' | 'bottom' | 'left' | undefined;
}) {
  const t = useTranslations('Header.locale');
  const pathname = usePathname();

  const [selectedLocale, setSelectedLocale] = useState<string | undefined>(
    locale,
  );
  const alternatePaths = usePathStore((state) => state.alternatePaths);
  const router = useRouter();
  const changeLocale = (newLocale: string) => {
    setSelectedLocale(newLocale);
    const targetPath = alternatePaths?.[newLocale] || pathname;
    // router.replace(pathname, { locale: newLocale });
    router.replace(targetPath, { locale: newLocale });
  };
  useEffect(() => {
    if (locale && selectedLocale !== locale) {
      setTimeout(() => setSelectedLocale(locale), 0);
    }
  }, [locale, selectedLocale]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <Button
          variant="default"
          className="h-full border-b-2 border-foreground bg-foreground hover:border-b-2 hover:border-b-[#e31e24] transition-colors"
        >
          {parseLocale[selectedLocale as keyof typeof parseLocale]}
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="rounded-md gap-2"
        align={align}
        side={side}
      >
        <DropdownMenuItem
          className={cn('rounded-md', {
            'bg-gray-200': selectedLocale === 'uk',
          })}
          onClick={() => changeLocale('uk')}
        >
          {t('uk')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn('rounded-md', {
            'bg-gray-200': selectedLocale === 'ru',
          })}
          onClick={() => changeLocale('ru')}
        >
          {t('ru')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
