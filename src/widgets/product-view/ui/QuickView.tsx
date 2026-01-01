'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog';

export const QuickView = ({
  children,
  open,
}: {
  open: boolean;
  children: React.ReactNode;
}) => {
  const router = useRouter();

  const handleOpen = () => {
    router.back();
  };
  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTitle>
        {/*<div>{product.title}</div>*/}
        123
      </DialogTitle>
      <DialogContent className="max-w-3xl lg:max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {children}
      </DialogContent>
    </Dialog>
  );
};
