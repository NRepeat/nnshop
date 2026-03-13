'use client';

import { useGridStore } from '@shared/store/use-grid-store';
import { GripIcon } from './GridIcons';

export function GridToggle() {
  const { cols, setCols } = useGridStore();

  return (
    <button
      type="button"
      onClick={() => setCols(cols === '2' ? '3' : '2')}
      aria-label={cols === '2' ? '3 columns' : '2 columns'}
      className="cursor-pointer p-0 bg-transparent border-none"
    >
      <GripIcon size={24} className="p-1 rounded transition-colors text-foreground" />
    </button>
  );
}
