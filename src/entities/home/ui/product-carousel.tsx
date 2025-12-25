import { CardCarousel } from '@entities/home/ui/cardCarousel';
import Image from 'next/image';

const LeftImage = `${process.env.BLOB_BASE_URL}/assests/home/image/home-banner/hero-banner-left.png`;

const products = [
  {
    node: {
      title: 'Product 1',
      featuredImage: {
        url: LeftImage,
        width: 400,
        height: 400,
      },
      amount: 100,
      currency: '$',
    },
  },
  {
    node: {
      title: 'Product 2',
      featuredImage: {
        url: LeftImage,
        width: 400,
        height: 400,
      },
      amount: 100,
      currency: '$',
    },
  },
  {
    node: {
      title: 'Product 2',
      featuredImage: {
        url: LeftImage,
        width: 400,
        height: 400,
      },
      amount: 100,
      currency: '$',
    },
  },
  {
    node: {
      title: 'Product 2',
      featuredImage: {
        url: LeftImage,
        width: 400,
        height: 400,
      },
      amount: 100,
      currency: '$',
    },
  },
];
const items = products.map((product) => (
  <div key={product.node.title} className="flex flex-col gap-3 pl-2.5">
    <div className="flex-col flex">
      <Image
        src={product.node.featuredImage?.url}
        alt={product.node.title}
        className="w-full h-full object-cover"
        width={product.node.featuredImage?.width || 400}
        height={product.node.featuredImage?.height || 400}
      />
    </div>
    <div className="flex flex-col gap-0.5">
      <p className="text-start font-sans  text-base group-hover:underline text-ellipsis overflow-hidden">
        {product.node.title}
      </p>
      <div className="flex flex-1">
        <p className=" font-400 text-xs">
          <span> {product.node.currency}</span>
          {product.node.amount}
        </p>
      </div>
    </div>
  </div>
));

export const ProductCarousel = () => {
  return (
    <div className="product-carousel">
      <div className="py-8 flex flex-col gap-12">
        <p className="px-8 text-xl font-400 text-forgraund">What to Wear Now</p>
        <CardCarousel
          items={items}
          scrollable={false}
          className="basis-1/2 md:basis-1/4 ml-4"
        />
      </div>
    </div>
  );
};
