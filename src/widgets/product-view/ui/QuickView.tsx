'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { useEffect, useState } from 'react';

export const QuickView = ({
  children,
  open,
}: {
  open: boolean;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  console.log(isOpen, 'isOpen');
  // useEffect(() => {
  //   if (!isOpen) {
  //     router.back();
  //   }
  // }, [isOpen, router]);
  const handleOpen = () => {
    // setIsOpen(false)
    router.back();
  };
  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {children}
      </DialogContent>
    </Dialog>
  );
};
