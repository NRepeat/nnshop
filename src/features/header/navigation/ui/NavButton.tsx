'use client';
import { cn } from '@shared/lib/utils';
import { Link, usePathname } from '@shared/i18n/navigation';
import { genders } from '@shared/i18n/routing';
import { useTransition, useState, useMemo, useEffect } from 'react';
import { detectGenderFromHandle } from '@entities/collection/lib/resolve-handle';
import { DEFAULT_GENDER } from '@shared/config/shop';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProductGenderStore } from '@shared/store/use-product-gender-store';

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
  const [isPending, startTransition] = useTransition();
  const [optimisticSlug, setOptimisticSlug] = useState<string | null>(null);

  const segments = pathname.split('/').filter(Boolean);
  const isBrandPage = segments[0] === 'brand';
  const isProductPage = segments.includes('product');

  const productGender = useProductGenderStore((s) => s.productGender);

  const genderInUrl = isBrandPage
    ? (searchParams.get('_gender') ?? undefined)
    : pathname.split('/').find((s) => genders.includes(s));

  useEffect(() => {
    setOptimisticSlug(null);
    router.refresh();
  }, [pathname, router]);

  // On product pages: derive active state from product's gender metafield
  // unisex → neither button is active; null → fall back to header gender prop
  const effectiveGender = isProductPage && productGender !== null
    ? (productGender === 'unisex' ? null : productGender)
    : (genderInUrl ?? gender ?? DEFAULT_GENDER);

  const isRootPage = pathname === '/';

  const isActive = isRootPage
    ? false
    : optimisticSlug
      ? optimisticSlug === slug
      : effectiveGender === slug;

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
