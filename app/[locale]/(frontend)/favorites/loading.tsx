import { Skeleton } from '@shared/ui/skeleton';

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="mt-4 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

export default async function FavoritesLoading() {
  // const t = await getTranslations('FavoritesPage');
  // const tHeader = await getTranslations('Header.nav');

  // const breadcrumbItems = [
  //   { label: tHeader('home'), href: '/' },
  //   { label: t('title'), href: '/favorites', isCurrent: true },
  // ];

  return (
    <div className="container mx-auto mt-2 py-10 md:mt-10">
      {/* <Breadcrumbs items={breadcrumbItems} /> */}
      <Skeleton className="my-4 text-2xl font-bold"></Skeleton>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
