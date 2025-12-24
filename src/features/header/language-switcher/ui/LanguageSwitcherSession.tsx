import { LanguageSwitcher } from './LanguageSwitcher';

export const LanguageSwitcherSession = async ({
  className,
}: {
  className?: string;
}) => {
  return <LanguageSwitcher className={className} />;
};
