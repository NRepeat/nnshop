'use client';

import { useEffect } from 'react';

const VALID_GENDERS = ['woman', 'man'];

export const SetGenderCookie = ({ gender }: { gender: string }) => {
  useEffect(() => {
    if (!VALID_GENDERS.includes(gender)) return;
    document.cookie = `gender=${gender};path=/;max-age=${60 * 60 * 24 * 365}`;
  }, [gender]);

  return null;
};
