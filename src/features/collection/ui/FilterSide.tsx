'use client';

import { Filter } from '@shared/lib/shopify/types/storefront.types';
import { FilterSheet } from './FilterSheet';
import { CollectionFilters } from './CollectionFilters';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@shared/ui/button';
import { ChevronRight } from 'lucide-react';

export const FilterSide = ({ filters }: { filters: Filter[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="">
      <div className="block md:hidden">
        <FilterSheet filters={filters} />
      </div>

      <div className="hidden md:flex  sticky top-[165px]  ">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0, x: '-100%' }}
              animate={{ width: 'auto', opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: '-100%' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="overflow-hidden "
              style={{ position: 'relative' }}
            >
              <CollectionFilters filters={filters} />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className="absolute top-0 right-0 "
          initial={{ rotate: -90 }}
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="   flex flex-row items-center justify-center "
          >
            <p>
              <span className="whitespace-nowrap transform mb-2">Фільтр</span>
            </p>

            <ChevronRight className="h-4 w-4 rotate-90" />
          </Button>
        </motion.div>
      </div>
    </aside>
  );
};
