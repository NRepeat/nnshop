'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog';
import { cn } from '@shared/lib/utils';

export const QuickView = ({
  children,
  open,
  className,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  const router = useRouter();

  const handleOpen = () => {
    router.back();
  };
  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTitle>{/*<div>{product.title}</div>*/}</DialogTitle>
      <DialogContent
        className={cn(
          'max-w-3xl lg:max-w-5xl  max-h-[90vh] overflow-y-auto rounded  w-[90%]',
          className,
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};
