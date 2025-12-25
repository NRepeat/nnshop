import { CardCarousel } from '@entities/home/ui/cardCarousel';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';

const LeftImage = `https://qipmjw4uaan1zz27.public.blob.vercel-storage.com/assests/home/image/home-banner/hero-banner-left.png`;

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

export const ProductCarousel = () => {
  const items = products.map((product, index) => {
    return (
      <Link href={product.node.title}>
        <div
          key={index}
          className="flex flex-col gap-3 group relative overflow-hidden group"
          // onMouseOver={() => setExpandedIndex(isExpanded ? null : index)}
        >
          <div className="flex-col flex relative overflow-hidden">
            <Image
              src={product.node.featuredImage?.url}
              alt={product.node.title}
              className="w-full h-full object-cover"
              width={400}
              height={400}
            />

            {/*<motion.div
              initial={false}
              animate={{
                height: isExpanded ? '50%' : '48px',
                backgroundColor: isExpanded
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'rgba(255, 255, 255, 0)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 flex flex-col  justify-center overflow-hidden backdrop-blur-sm items-end group-hover:opacity-100 opacity-0"
            >
              <Button
                variant="link"
                size="icon"
                className="hover:bg-transparent"
                onMouseDown={handleButtonClick}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PlusIcon className="min-w-6 min-h-6" />
                </motion.div>
              </Button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-4 text-center"
                  >
                    <p className="font-bold">Quick Add to Cart</p>
                    <Button className="mt-2 w-full">Add to Bag</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>*/}
          </div>

          <div className="flex flex-col gap-0.5">
            <p className="text-start font-sans text-base group-hover:underline">
              {product.node.title}
            </p>
            <p className="font-400 text-xs">
              {product.node.currency}
              {product.node.amount}
            </p>
          </div>
        </div>
      </Link>
    );
  });

  return (
    <div className="product-carousel container">
      <div className="py-8 flex flex-col gap-12">
        <p className="px-4 text-xl font-400">What to Wear Now</p>
        <CardCarousel
          items={items}
          scrollable={false}
          className="basis-1/2 md:basis-1/4 ml-4"
        />
      </div>
    </div>
  );
};
