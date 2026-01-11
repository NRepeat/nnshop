'use client';

import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'use-intl';
import { usePathname, useRouter } from '@shared/i18n/navigation';
import { useState } from 'react';
import { cn } from '@shared/lib/utils';

export function LanguageSwitcher({
  className,
  align,
}: {
  className?: string;
  align?: 'center' | 'start' | 'end' | undefined;
}) {
  const t = useTranslations('Header.locale');
  const locale = useLocale();
  const pathname = usePathname();
  const [selectedLocale, setSelectedLocale] = useState<string>(locale);

  const router = useRouter();
  const changeLocale = (newLocale: string) => {
    setSelectedLocale(newLocale);
    router.replace(pathname, { locale: newLocale });
  };
  const parseLocale = {
    ru: 'РУС',
    uk: 'УКР',
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <Button
          variant="default"
          className="h-full underline border-b-2 border-foreground hover:border-b-2 hover:border-b-[#e31e24]"
        >
          {parseLocale[selectedLocale as keyof typeof parseLocale]}
          {/*<Globe />*/}
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-none gap-2" align={align}>
        <DropdownMenuItem
          className={cn('rounded-none', {
            'bg-gray-200': selectedLocale === 'ru',
          })}
          onClick={() => changeLocale('ru')}
        >
          {t('ru')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn('rounded-none', {
            'bg-gray-200': selectedLocale === 'uk',
          })}
          onClick={() => changeLocale('uk')}
        >
          {t('uk')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
