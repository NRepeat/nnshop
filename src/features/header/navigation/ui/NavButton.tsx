'use client';
import { Button } from '@shared/ui/button';
import { cn } from '@shared/lib/utils';
import { usePathname, useRouter } from '@shared/i18n/navigation';
import { genders } from '@shared/i18n/routing';
import { useTransition, useState, useEffect } from 'react';
import { detectGenderFromHandle } from '@entities/collection/lib/resolve-handle';

export const NavButton = ({
  children,
  gender,
  slug,
  level2Map,
  className,
}: {
  slug: string;
  children?: React.ReactNode;
  gender?: string;
  level2Map?: Record<string, string>;
  className?: string;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticSlug, setOptimisticSlug] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticSlug(null);
  }, [pathname]);

  const genderInUrl = pathname.split('/').find((segment) => genders.includes(segment));
  const resolvedActive = genderInUrl ? genderInUrl === slug : (gender || 'woman') === slug;
  const isActive = optimisticSlug ? optimisticSlug === slug : resolvedActive;

  const onClick = () => {
    setOptimisticSlug(slug);
    document.cookie = `gender=${slug};path=/;max-age=${60 * 60 * 24 * 365}`;

    const segments = pathname.split('/').filter(Boolean);
    const currentHandle = segments[1];

    let destination = `/${slug}`;
    if (currentHandle) {
      const handleGender = detectGenderFromHandle(currentHandle);
      if (handleGender === slug) {
        // Handle already belongs to target gender — navigate directly
        destination = `/${slug}/${currentHandle}`;
      } else if (level2Map?.[currentHandle]) {
        // Map to the equivalent collection for the target gender
        destination = `/${slug}/${level2Map[currentHandle]}`;
      }
    }

    startTransition(() => {
      router.push(destination);
      setTimeout(() => router.refresh(), 0);
    });
  };

  return (
    <Button
      className={cn(
        'w-full cursor-pointer text-nowrap md:text-base font-light font-sans h-full px-6 text-lg md:px-5 md:py-2',
        'border-b-2 border-transparent hover:bg-accent/50 hover:underline duration-300 decoration-transparent hover:decoration-primary transition-all',
        { 'border-b-primary': isActive },
        { 'opacity-60': isPending && !isActive },
        className,
      )}
      variant="ghost"
      onClick={onClick}
    >
      {children}
    </Button>
  );
};
