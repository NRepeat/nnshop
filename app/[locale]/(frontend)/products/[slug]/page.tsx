import { getProduct } from '@/entities/product/api/getProduct';
import { ProductView } from '@/widgets/product-view';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    slug: string;
    locale: string;
  };
};

export default async function ProductPage({ params }: Props) {
  // The getProduct function returns the raw response from the storefront API
  // which has a `product` property inside the `data` property.
  const response: any = await getProduct({ handle: params.slug });
  const product = response?.product;

  if (!product) {
    return notFound();
  }

  return <ProductView product={product} />;
}
