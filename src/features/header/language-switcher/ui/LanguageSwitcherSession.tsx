import { getLocale } from 'next-intl/server';
import { LanguageSwitcher } from './LanguageSwitcher';

export const LanguageSwitcherSession = async ({
  className,
}: {
  className?: string;
}) => {
  const locale = await getLocale();
  return <LanguageSwitcher className={className} locale={locale} />;
};
