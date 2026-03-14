'use client';

import { useGridStore } from '@shared/store/use-grid-store';
import { GripIcon } from './GridIcons';
import { usePostHog } from 'posthog-js/react';

export function GridToggle() {
  const { cols, setCols } = useGridStore();
  const posthog = usePostHog();

  return (
    <button
      type="button"
      onClick={() => {
        const newCols = cols === '2' ? '3' : '2';
        setCols(newCols);
        posthog?.capture('collection_grid_layout_changed', {
          layout: newCols,
        });
      }}
      aria-label={cols === '2' ? '3 columns' : '2 columns'}
      className="cursor-pointer p-0 bg-transparent border-none"
    >
      <GripIcon size={24} className="p-1 rounded transition-colors text-foreground" />
    </button>
  );
}
