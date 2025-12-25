import Link from 'next/link';
import Image from 'next/image';

const LeftImage = `${process.env.BLOB_BASE_URL}/assests/home/image/home-banner/hero-banner-left.png`;

type Collection = {
  label: string;
  slug: string;
  image: string;
};

const collections: Collection[] = [
  { label: 'Collection 1', slug: '1', image: LeftImage },
  { label: 'Collection 2', slug: '2', image: LeftImage },
  { label: 'Collection 3', slug: '3', image: LeftImage },
  { label: 'Collection 4', slug: '4', image: LeftImage },
];

export const MainCollectionGrid = () => {
  return (
    <div className="main-collection-grid flex flex-col container ">
      <div className=" gap-12 flex flex-col py-8">
        <p className="p-4 font-400 text-xl">
          Elevate your lifestyle with a more intelligent, superior wardrobe. Our
          range is crafted sustainably with longevity in mind.
        </p>
        <div className="flex flex-col gap-5">
          {collections.map((collection) => (
            <Link href={collection.slug} key={collection.slug}>
              <div className="flex flex-col relative">
                <h3 className="text-white text-xl  font-sans font-400 absolute bottom-5 left-5">
                  {collection.label}
                </h3>
                <Image
                  src={collection.image}
                  alt={collection.label}
                  className="object-cover w-full max-h-[598px]"
                  width={375}
                  height={598}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
