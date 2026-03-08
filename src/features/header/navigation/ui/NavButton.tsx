'use client';
import { Button } from '@shared/ui/button';
import { cookieFenderSet } from '../api/setCookieGender';
import { cn } from '@shared/lib/utils';
import { usePathname, useRouter } from '@shared/i18n/navigation';
import { genders } from '@shared/i18n/routing';

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

  const genderInUrl = pathname.split('/').find((segment) => genders.includes(segment));
  const isActive = genderInUrl ? genderInUrl === slug : (gender || 'woman') === slug;

  const onClick = async () => {
    await cookieFenderSet(slug);

    // Try to navigate to the equivalent level-2 collection for the target gender
    const segments = pathname.split('/').filter(Boolean);
    // pathname from next-intl is locale-stripped, so segments = [gender, handle?, ...]
    const currentHandle = segments[1]; // e.g. "zhinoche-vzuttya"

    if (currentHandle && level2Map && level2Map[currentHandle]) {
      const mappedHandle = level2Map[currentHandle];
      router.push(`/${slug}/${mappedHandle}`);
    } else {
      router.push(`/${slug}`);
    }
  };

  return (
    <Button
      className={cn(
        'w-full cursor-pointer text-nowrap md:text-base font-300 font-sans h-full px-6 text-lg md:px-5 md:py-2',
        'border-b-2 border-transparent hover:bg-accent/50 hover:underline duration-300 decoration-transparent hover:decoration-primary transition-all',
        { 'border-b-primary': isActive },
        className,
      )}
      variant="ghost"
      onClick={onClick}
    >
      {children}
    </Button>
  );
};
