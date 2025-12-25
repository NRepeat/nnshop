import Image from 'next/image';
import { Button } from '@shared/ui/button';

const LeftImage = `${process.env.BLOB_BASE_URL}/assests/home/image/home-banner/hero-banner-left.png`;

export const HeroBanner = () => {
  return (
    <div className="hero-banner relative">
      <Image
        src={LeftImage}
        alt=""
        className=" object-cover w-full max-h-[598px]"
        width={375}
        height={598}
      />
      <div className="absolute bottom-16 left-[32px] w-fit flex flex-col gap-5">
        <p className="text-white text-xl  font-sans font-400">
          Elevate Your Style <br /> Timeless Fashion,
          <br /> Sustainable <br /> Choices
        </p>
        <Button className="w-[120px]" variant={'secondary'}>
          Shop now
        </Button>
      </div>
    </div>
  );
};
