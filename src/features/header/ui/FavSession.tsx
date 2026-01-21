'use client';
import { addToFavorites } from '@entities/favorite/api/add-to-fav';
import { useRouter } from '@shared/i18n/navigation';
import { Button } from '@shared/ui/button';
import { Heart } from 'lucide-react';

export const FavSession = () => {
  const nav = useRouter();
  const handleAddToFavorites = async () => {
    const data = await addToFavorites('1', '1');
    if (!data) {
      nav.push(`/auth/sign-in`, { scroll: false });
    }
  };
  return (
    <Button
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault();
        await handleAddToFavorites();
      }}
      variant="ghost"
      size="icon"
      className="hover:[&>svg]:stroke-[#e31e24]"
    >
      <Heart />
    </Button>
  );
};
