import Image from 'next/image';
import { CardCarousel } from './cardCarousel';

export const StoriesCarousel = () => {
  const items: { image: string }[] = [
    { image: `${process.env.BLOB_BASE_URL}/assests/home/image/stories/1.png` },
    { image: `${process.env.BLOB_BASE_URL}/assests/home/image/stories/2.png` },
    { image: `${process.env.BLOB_BASE_URL}/assests/home/image/stories/3.png` },
    { image: `${process.env.BLOB_BASE_URL}/assests/home/image/stories/4.png` },
    { image: `${process.env.BLOB_BASE_URL}/assests/home/image/stories/5.png` },
    { image: `${process.env.BLOB_BASE_URL}/assests/home/image/stories/6.png` },
    { image: `${process.env.BLOB_BASE_URL}/assests/home/image/stories/7.png` },
    { image: `${process.env.BLOB_BASE_URL}/assests/home/image/stories/8.png` },
    { image: `${process.env.BLOB_BASE_URL}/assests/home/image/stories/9.png` },
  ];
  const itemsComponent = items.map((item, index) => (
    <Image
      loading="lazy"
      key={index}
      src={item.image}
      alt={`Story ${index + 1}`}
      width={200}
      height={200}
      className=" object-cover w-[200px] h-[200px]"
    />
  ));
  return (
    <div className="py-12 flex justify-center items-center flex-col gap-12  ">
      <div className="text-2xl text-center">
        <span>Shop Instagram</span>
      </div>
      <CardCarousel
        items={itemsComponent}
        className="basis-1/2 pl-0 w-[200px]"
        loop
      />
    </div>
  );
};
