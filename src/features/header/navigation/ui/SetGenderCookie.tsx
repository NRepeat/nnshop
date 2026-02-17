'use client';

import { useEffect } from 'react';

export const SetGenderCookie = ({ gender }: { gender: string }) => {
  useEffect(() => {
    document.cookie = `gender=${gender};path=/;max-age=${60 * 60 * 24 * 365}`;
  }, [gender]);

  return null;
};
