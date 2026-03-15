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
import { useEffect, useRef, useState, useTransition } from 'react';
import { usePostHog } from 'posthog-js/react';
import { cn } from '@shared/lib/utils';
import { usePathStore } from '@/shared/store/use-path-store';
import { cleanSlug } from '@shared/lib/utils/cleanSlug';
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
  const localeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alternatePaths = usePathStore((state) => state.alternatePaths);
  const router = useRouter();
  const posthog = usePostHog();
  const [isPending, startTransition] = useTransition();
  const changeLocale = (newLocale: string) => {
    setSelectedLocale(newLocale);
    posthog?.capture('locale_switched', {
      locale: newLocale,
      previous_locale: selectedLocale,
    });
    const targetPath = (alternatePaths?.[newLocale] || pathname) as string;
    const sanitizedPath = cleanSlug(targetPath);
    startTransition(() => {
      router.replace(sanitizedPath, { locale: newLocale });
    });
  };
  useEffect(() => {
    if (locale && selectedLocale !== locale) {
      localeTimerRef.current = setTimeout(() => setSelectedLocale(locale), 0);
    }
    return () => {
      if (localeTimerRef.current) clearTimeout(localeTimerRef.current);
    };
  }, [locale, selectedLocale]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <Button
          variant="default"
          className={cn('h-full transition-opacity duration-200', {
            'opacity-50': isPending,
          })}
        >
          <span className={cn('transition-all duration-200', { 'blur-[2px]': isPending })}>
            {parseLocale[selectedLocale as keyof typeof parseLocale]}
          </span>
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="rounded gap-2"
        align={align}
        side={side}
      >
        <DropdownMenuItem
          className={cn('rounded', {
            'bg-gray-200': selectedLocale === 'uk',
          })}
          onClick={() => changeLocale('uk')}
        >
          {t('uk')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn('rounded', {
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
