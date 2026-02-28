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
      <DialogTitle>{/*<div>{product.title}</div>*/}</DialogTitle>
      <DialogContent className="max-w-3xl lg:max-w-5xl  max-h-[70vh] overflow-y-auto  w-[90%]">
        {children}
      </DialogContent>
    </Dialog>
  );
};
