'use client';

import { useOptimistic, useTransition } from 'react';
import { toggleFavoriteProduct } from '@features/product/api/toggle-favorite';
import { useRouter } from '@shared/i18n/navigation';
import { Button } from '@shared/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@shared/lib/utils'; // если есть утиль для классов

export const FavSession = ({
  productId,
  handle,
  fav, // начальное значение с сервера
}: {
  productId: string;
  handle: string;
  fav: boolean | undefined;
}) => {
  console.log('🚀 ~ FavSession ~ fav:', fav);
  console.log('🚀 ~ FavSession ~ productId:', productId);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimisticFav, updateOptimisticFav] = useOptimistic(
    fav,
    (state, newState: boolean) => newState,
  );

  const handleToggle = async () => {
    // 1. Мгновенно обновляем UI
    startTransition(async () => {
      updateOptimisticFav(!optimisticFav);

      // 2. Вызываем серверный экшен
      const result = await toggleFavoriteProduct(productId, handle);
      console.log('🚀 ~ handleToggle ~ result:', result);

      // 3. Если ошибка или не авторизован — редирект и состояние откатится само
      if (!result.success) {
        if (result.error === 'AUTH_REQUIRED') {
          router.push(`/auth/sign-in`, { scroll: false });
        }
        // Здесь не нужно вручную откатывать состояние,
        // useOptimistic вернется к значению пропса `fav`, когда экшен завершится.
      }
    });
  };

  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!isPending) handleToggle();
      }}
      variant="ghost"
      size="icon"
      disabled={isPending}
      className="group hover:[&>svg]:stroke-[#e31e24]"
    >
      <Heart
        className={cn(
          'transition-all duration-300',
          optimisticFav
            ? 'fill-[#e31e24] stroke-[#e31e24] scale-110'
            : ' group-hover:[&>svg]:stroke-[#e31e24]',
        )}
      />
    </Button>
  );
};
