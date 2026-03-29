'use client';

import { useState, useReducer, memo } from 'react';
import { toast } from 'sonner';
import { toggleFavoriteProduct } from '@features/product/api/toggle-favorite';
import { useRouter } from '@shared/i18n/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@shared/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { useSession } from '@features/auth/lib/client';

export const FavSession = memo(({
  productId,
  fav,
  handle,
}: {
  productId: string;
  handle: string;
  fav?: boolean | undefined;
}) => {
  
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'uk';
  const [isFav, setIsFav] = useState(fav);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const session = useSession();

  const handleToggle = async () => {
    if (isProcessing) return;

    const user = session.data?.user as (NonNullable<typeof session.data>['user'] & { isAnonymous?: boolean }) | undefined;
    if (!user || user.isAnonymous) {
      // Preserve current search params to keep the background state stable
      const currentQuery = window.location.search;
      router.push(`/auth/sign-in${currentQuery}`, { scroll: false });
      return;
    }

    const previousValue = isFav;
    const nextValue = !isFav;

    setIsProcessing(true);
    setIsFav(nextValue);

    try {
      const result = await toggleFavoriteProduct(
        productId,
        session.data,
        locale,
        handle,
      );

      if (!result.success) {
        setIsFav(previousValue);
        if (result.error === 'AUTH_REQUIRED') {
          const currentQuery = window.location.search;
          router.push(`/auth/sign-in${currentQuery}`, { scroll: false });
        } else {
          toast("Couldn't save favorite. Try again.");
        }
      } else {
        setIsFav(result.isFavorited);
        if (result.isFavorited && typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'add_to_wishlist', {
            items: [{ item_id: productId }],
          });
        }
        router.refresh();
      }
    } catch {
      setIsFav(previousValue);
      toast("Couldn't save favorite. Try again.");
    } finally {
      setIsProcessing(false);
      forceUpdate();
    }
  };

  return (
    <Button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handleToggle();
      }}
      variant="ghost"
      size="icon"
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      disabled={isProcessing}
      className={cn(
        'relative z-20 group hover:bg-transparent transition-opacity hover:[&>svg]:stroke-[#e31e24] h-fit w-fit',
        isProcessing && 'opacity-70 cursor-not-allowed',
      )}
    >
      <Heart
        className={cn(
          'transition-all duration-300 pointer-events-none',
          isFav
            ? 'fill-[#e31e24] stroke-[#e31e24] scale-110'
            : 'stroke-current group-hover:stroke-[#e31e24]',
          isProcessing && 'scale-90 opacity-50',
        )}
      />
    </Button>
  );
});

FavSession.displayName = 'FavSession';