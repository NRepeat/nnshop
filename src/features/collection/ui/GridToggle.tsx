'use client';

import { useGridStore } from '@shared/store/use-grid-store';
import { GripIcon } from './GridIcons';

export function GridToggle() {
  const { cols, setCols } = useGridStore();

  return (
    <GripIcon
      size={24}
      onClick={() => setCols(cols === '2' ? '3' : '2')}
      aria-label={cols === '2' ? '3 columns' : '2 columns'}
      className="cursor-pointer p-1 rounded transition-colors text-foreground"
    />
  );
}
