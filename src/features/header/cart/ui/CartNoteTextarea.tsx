'use client';

import { useEffect, useCallback } from 'react';
import { Textarea } from '@shared/ui/textarea';
import { useCartNoteStore } from '@shared/store/use-cart-note-store';
import { updateCartNote } from '@entities/cart/api/update-note';
import { useDebouncedCallback } from 'use-debounce';

type CartNoteTextareaProps = {
  placeholder?: string;
};

export const CartNoteTextarea = ({ placeholder }: CartNoteTextareaProps) => {
  const { note, setNote } = useCartNoteStore();

  const syncNoteToShopify = useDebouncedCallback(async (noteValue: string) => {
    await updateCartNote(noteValue);
  }, 500);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newNote = e.target.value;
      setNote(newNote);
      syncNoteToShopify(newNote);
    },
    [setNote, syncNoteToShopify]
  );

  return (
    <Textarea
      placeholder={placeholder}
      value={note}
      onChange={handleChange}
    />
  );
};
