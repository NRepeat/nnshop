'use client';
import { cn } from '@shared/lib/utils';
import { usePathname } from '@shared/i18n/navigation';
import { genders } from '@shared/i18n/routing';
import { useTransition, useState, useMemo, useEffect } from 'react';
import { detectGenderFromHandle } from '@entities/collection/lib/resolve-handle';
import { DEFAULT_GENDER } from '@shared/config/shop';
import { usePostHog } from 'posthog-js/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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

  const segments = pathname.split('/').filter(Boolean);
  const isBrandPage = segments[0] === 'brand';

  const genderInUrl = isBrandPage
    ? (searchParams.get('_gender') ?? undefined)
    : pathname.split('/').find((s) => genders.includes(s));

  useEffect(() => {
    setOptimisticSlug(null);
  }, [pathname]);

  const isActive = optimisticSlug
    ? optimisticSlug === slug
    : (genderInUrl ?? gender ?? DEFAULT_GENDER) === slug;

  const toPath = useMemo(() => {
    if (isBrandPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('_gender', slug);
      return `/brand/${segments[1]}?${params.toString()}`;
    }
    const currentHandle = segments[1];
    if (!currentHandle) return `/${slug}`;
    if (detectGenderFromHandle(currentHandle) === slug && !segments.includes("product") ) {
      return `/${slug}/${currentHandle}`;
    }

    if (level2Map?.[currentHandle]) {
      return `/${slug}/${level2Map[currentHandle]}`;
    }

    return `/${slug}`;
  }, [pathname, slug, isBrandPage, searchParams, level2Map]);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOptimisticSlug(slug);
    document.cookie = `gender=${slug};path=/;max-age=${60 * 60 * 24 * 365}`;
    posthog?.capture('gender_switched', {
      gender: slug,
      previous_gender: genderInUrl ?? gender ?? DEFAULT_GENDER,
    });
    startTransition(() => {
      router.push(toPath);
      router.refresh();
    });
  };

  return (
    <Link
      href={toPath}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center cursor-pointer text-nowrap',
        'md:text-base font-light font-sans h-full px-6 text-lg md:px-5 md:py-2',
        'border-b-2 border-transparent hover:bg-accent/50 hover:underline duration-300',
        'decoration-transparent hover:decoration-primary transition-all h-12',
        { 'border-b-primary': isActive },
        { 'opacity-60': isPending && !isActive },
        className,
      )}
    >
      {children}
    </Link>
  );
};
