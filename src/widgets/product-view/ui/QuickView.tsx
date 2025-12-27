'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export const QuickView = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        router.back();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div
        ref={dialogRef}
        className="bg-white p-8 rounded-lg relative max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <X className="h-6 w-6" />
        </button>
        {children}
      </div>
    </div>
  );
};
