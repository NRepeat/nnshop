'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog';
import { cn } from '@shared/lib/utils';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useCallback } from 'react';

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
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0.3]);

  const handleClose = () => {
    router.back();
  };

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      if (info.offset.y > 100 || info.velocity.y > 500) {
        handleClose();
      }
    },
    [router],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTitle>{/*<div>{product.title}</div>*/}</DialogTitle>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        aria-describedby={undefined}
        className={cn(
          'max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-y-auto rounded w-[90%] p-0',
          className,
        )}
      >
        <motion.div
          className="md:hidden w-full"
          style={{ y, opacity }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.4}
          onDragEnd={handleDragEnd}
        >
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        </motion.div>
        <div className="p-4 md:p-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
};
