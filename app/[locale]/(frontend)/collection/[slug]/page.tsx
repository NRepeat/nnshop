import { getCollection } from '@entities/collection/api/getCollection';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';

type Props = {
  params: { slug: string; locale: string };
};

export default async function CollectionPage({ params }: Props) {
  if (!params.slug) {
    return notFound();
  }

  const collectionData = await getCollection({ handle: params.slug });
  const collection = collectionData.collection;

  if (!collection) {
    return notFound();
  }

  const products = collection.products.edges.map((edge) => edge.node);

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{collection.title}</h1>
        {collection.image && (
          <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
            <Image
              src={collection.image.url}
              alt={collection.image.altText || collection.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        {collection.description && (
          <p className="text-lg text-gray-600">{collection.description}</p>
        )}
      </header>
      <div className="lg:hidden mb-4">
        <Button variant="outline" className="w-full">
          Show Filters
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-8">
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-xl font-semibold mb-4">Filters</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Category</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-600 hover:text-black">
                      T-Shirts
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-black">
                      Hoodies
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-black">
                      Accessories
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Price</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full border-gray-300 rounded-md shadow-sm p-2"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>
        <main className="lg:col-span-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as Product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
