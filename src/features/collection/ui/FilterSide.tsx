'use client';

import { Filter } from '@shared/lib/shopify/types/storefront.types';
import { FilterSheet } from './FilterSheet';
import { CollectionFilters } from './CollectionFilters';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@shared/ui/button';
import { ChevronRight } from 'lucide-react';

export const FilterSide = ({ filters }: { filters: Filter[] }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className="">
      {/* Mobile filter sheet */}
      <div className="block md:hidden">
        <FilterSheet filters={filters} />
      </div>

      {/* Desktop collapsible filters */}
      <div className="hidden md:flex  sticky top-[105px] pt-10 ">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0, x: '-100%' }}
              animate={{ width: 'auto', opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
              style={{ position: 'relative' }}
            >
              <CollectionFilters filters={filters} />
            </motion.div>
          )}
        </AnimatePresence>
        <Button onClick={() => setIsOpen(!isOpen)} size="icon" className="flex">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="">Фільтр</span> <ChevronRight />
          </motion.div>
        </Button>
      </div>
    </aside>
  );
};
