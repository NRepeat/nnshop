import { Button } from '@shared/ui/button';
import clsx from 'clsx';
import Link from 'next/link';

const Step = ({
  title,
  link,
  isActive,
  isCompleted,
}: {
  title: string;
  link: string;
  isActive: boolean;
  isCompleted?: boolean;
}) => {
  return (
    <Button
      key={title}
      className={clsx('min-w-[100px]')}
      disabled={isCompleted}
      variant={isActive ? 'default' : 'ghost'}
    >
      <Link href={link} className={clsx('flex')}>
        <span className="hidden sm:inline capitalize">{title}</span>
      </Link>
    </Button>
  );
};

export default Step;
