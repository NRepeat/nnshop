'use client';

import { Filter } from '@shared/lib/shopify/types/storefront.types';
import { CollectionFilters } from './CollectionFilters';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@shared/ui/button';

export const FilterSide = ({ filters }: { filters: Filter[] }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className="">
      <div className="hidden md:flex  sticky top-[135px] ">
        {/*<AnimatePresence>*/}
        {isOpen && (
          <motion.div
          // initial={{ width: 0, opacity: 1, x: '100%' }}
          // animate={{ width: 'auto', opacity: 1, x: 0 }}
          // exit={{ width: 0, opacity: 0, x: '-100%' }}
          // transition={{ duration: 0.4, ease: 'easeInOut' }}
          // className="overflow-hidden "
          // style={{ position: 'relative' }}
          >
            <CollectionFilters filters={filters} />
          </motion.div>
        )}
        {/*</AnimatePresence>*/}
        <motion.div
          className="absolute  -right-[15px] "
          initial={{ rotate: 0, y: 0, opacity: 0 }}
          animate={{
            opacity: 1,
            rotate: isOpen ? 0 : -90,
            y: isOpen ? 0 : 25,
            x: isOpen ? 5 : 25,
          }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="   flex flex-row items-center justify-center "
          >
            <p>
              <span className="whitespace-nowrap transform mb-2">
                {isOpen ? 'Закрити' : 'Фільтри'}
              </span>
            </p>
          </Button>
        </motion.div>
      </div>
    </aside>
  );
};
