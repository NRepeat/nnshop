'use client';

import React, { createContext, useContext, useState,useCallback } from 'react';
import { saveGenderPreference } from '../api/saveGender';
import { cookieFenderSet } from '../api/setCookieGender';

type Gender = 'woman' | 'man';

interface GenderContextType {
  gender: Gender;
  setGender: (gender: Gender) => void;
  isLoading: boolean;
}

const GenderContext = createContext<GenderContextType | undefined>(undefined);

export function GenderProvider({
  children,
  initialGender,
}: {
  children: React.ReactNode;
  initialGender: Gender;
}) {
  const [gender, setGenderState] = useState<Gender>(initialGender);
  const [isLoading, setIsLoading] = useState(false);

  const setGender = useCallback(async (newGender: Gender) => {
    setGenderState(newGender);
    setIsLoading(true);

    try {
      // Сохраняем в БД (для авторизованных) и cookies (для анонимных)
      await Promise.all([
        saveGenderPreference(newGender),
        cookieFenderSet(newGender),
      ]);
    } catch (error) {
      console.error('Failed to save gender preference:', error);
      // В случае ошибки откатываем изменение
      setGenderState(initialGender);
    } finally {
      setIsLoading(false);
    }
  }, [initialGender]);

  return (
    <GenderContext.Provider value={{ gender, setGender, isLoading }}>
      {children}
    </GenderContext.Provider>
  );
}

export function useGender() {
  const context = useContext(GenderContext);
  if (context === undefined) {
    throw new Error('useGender must be used within a GenderProvider');
  }
  return context;
}
