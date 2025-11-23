import { Button } from '@shared/ui/button';
import clsx from 'clsx';
import Link from 'next/link';

const Step = ({
  slug,
  link,
  isActive,
  isCompleted,
}: {
  slug: string;
  link: string;
  isActive: boolean;
  isCompleted?: boolean;
}) => {
  return (
    <Button
      key={slug}
      className={clsx('min-w-[100px]')}
      disabled={isCompleted}
      variant={isActive ? 'default' : 'ghost'}
    >
      <Link href={link} className={clsx('flex')}>
        <span className="hidden sm:inline capitalize">{slug}</span>
      </Link>
    </Button>
  );
};

export default Step;
