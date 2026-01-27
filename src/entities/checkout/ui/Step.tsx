import { Button } from '@shared/ui/button';
import clsx from 'clsx';
import { Link } from '@shared/i18n/navigation';import { type ReactNode } from 'react';

const Step = async ({
  title,
  link,
  isActive,
  disabled,
  icon,
}: {
  title: string;
  link: string;
  isActive: boolean;
  disabled?: boolean;
  icon: ReactNode;
}) => {
  return (
    <Button
      key={title}
      className={clsx('min-w-[50px] sm:min-w-[100px]')}
      disabled={disabled}
      variant={isActive ? 'default' : 'ghost'}
    >
      {/* <Link href={link} className={clsx('flex')}> */}
        <span className="sm:hidden">{icon}</span>
        <span className="hidden sm:inline capitalize">{title}</span>
      {/* </Link> */}
    </Button>
  );
};

export default Step;
