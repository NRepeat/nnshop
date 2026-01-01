import React from 'react';
import { cn } from '../lib/utils';

export const VisuallyHidden = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden clip-rect(0,0,0,0) whitespace-nowrap border-0',
        className,
      )}
    >
      {children}
    </span>
  );
};
