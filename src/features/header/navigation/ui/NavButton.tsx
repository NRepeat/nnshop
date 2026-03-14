'use client';
import { Button } from '@shared/ui/button';
import { cn } from '@shared/lib/utils';
import { usePathname, useRouter } from '@shared/i18n/navigation';
import { genders } from '@shared/i18n/routing';
import { useTransition, useState, useEffect } from 'react';
import { detectGenderFromHandle } from '@entities/collection/lib/resolve-handle';
import { DEFAULT_GENDER } from '@shared/config/shop';
import { usePostHog } from 'posthog-js/react';
import { useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const posthog = usePostHog();
  const [isPending, startTransition] = useTransition();
  const [optimisticSlug, setOptimisticSlug] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticSlug(null);
  }, [pathname]);

  const segments = pathname.split('/').filter(Boolean);
  const isBrandPage = segments[0] === 'brand';
  const genderInUrl = isBrandPage
    ? (searchParams.get('_gender') ?? undefined)
    : pathname.split('/').find((segment) => genders.includes(segment));
  const resolvedActive = genderInUrl ? genderInUrl === slug : (gender || DEFAULT_GENDER) === slug;
  const isActive = optimisticSlug ? optimisticSlug === slug : resolvedActive;

  const onClick = () => {
    setOptimisticSlug(slug);
    document.cookie = `gender=${slug};path=/;max-age=${60 * 60 * 24 * 365}`;

    posthog?.capture('gender_switched', { gender: slug, previous_gender: genderInUrl ?? gender ?? DEFAULT_GENDER });

    if (isBrandPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('_gender', slug);
      startTransition(() => {
        router.push(`/brand/${segments[1]}?${params.toString()}`);
        setTimeout(() => router.refresh(), 0);
      });
      return;
    }

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
