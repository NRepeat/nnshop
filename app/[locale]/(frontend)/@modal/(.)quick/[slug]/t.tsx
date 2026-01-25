// // @app/[locale]/(frontend)/@modal/(.)quick/[slug]/client.tsx
// 'use client';

// import { Suspense, useEffect } from 'react';
// import { useQueryState } from 'nuqs';
// import { QuickView } from '@/widgets/product-view/ui/QuickView';
// import { ProductViewSkeleton } from '@widgets/product-view/ui/ProductViewSkeleton';

// type Props = {
//   // params: { slug: string; locale: string };
//   children: React.ReactNode;
// };

// const ProductQuickViewPageClient = ({ children }: Props) => {
//   // const [open, setOpen] = useQueryState('quickview', {
//   //   history: 'push',
//   //   shallow: false,
//   // });

//   // const isOpen = open === params.slug;

//   return (
//     <QuickView open={true}>
//       <Suspense fallback={<ProductViewSkeleton />}>{children}</Suspense>
//     </QuickView>
//   );
// };

// export default ProductQuickViewPageClient;
