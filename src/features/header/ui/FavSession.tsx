'use client';

import { useState, useReducer, memo } from 'react';
import { toggleFavoriteProduct } from '@features/product/api/toggle-favorite';
import { useRouter } from '@shared/i18n/navigation';
import { Button } from '@shared/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { useSession } from '@features/auth/lib/client';
import { useLocale } from 'next-intl';

// ✅ Мемоизируем компонент
export const FavSession = memo(({
  productId,
  fav,
  handle,
}: {
  productId: string;
  handle: string;
  fav?: boolean | undefined;
}) => {
  console.log('🚀 ~ FavSession render ~ fav:', fav);
  
  const router = useRouter();
  const [isFav, setIsFav] = useState(fav);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const locale = useLocale();
  const session = useSession();

  const handleToggle = async () => {
    if (isProcessing) return;
    
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
          router.push(`/auth/sign-in`, { scroll: false });
        }
      } else {
        setIsFav(result.isFavorited);
        router.refresh();
      }
    } catch (err) {
      setIsFav(previousValue);
      console.error('Favorite toggle error:', err);
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
      disabled={isProcessing}
      className={cn(
        'relative z-20 group hover:bg-transparent transition-opacity hover:[&>svg]:stroke-[#e31e24]',
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

// ✅ Добавляем displayName для отладки
FavSession.displayName = 'FavSession';