import { Link } from '@shared/i18n/navigation';
import { Button } from '@shared/ui/button';
import clsx from 'clsx';
import { type ReactNode } from 'react';

const Step = async ({
  title,
  isActive,
  disabled,
  icon,
  link,
}: {
  title: string;
  isActive: boolean;
  disabled?: boolean;
  icon: ReactNode;
  link: string;
}) => {
  return (
    <Button
      key={title}
      className={clsx('min-w-[50px] sm:min-w-[100px]')}
      disabled={disabled}
      asChild
      variant={isActive ? 'default' : 'ghost'}
    >
      <Link href={link} className={clsx('flex')}>
        <span className="sm:hidden">{icon}</span>
        <span className="hidden sm:inline capitalize">{title}</span>
      </Link>
    </Button>
  );
};

export default Step;
