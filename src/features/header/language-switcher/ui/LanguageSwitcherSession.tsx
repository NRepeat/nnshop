import { LanguageSwitcher } from './LanguageSwitcher';

export const LanguageSwitcherSession = async ({
  className,
  locale,
}: {
  className?: string;
  locale?: string;
}) => {
  return <LanguageSwitcher className={className} locale={locale} />;
};
