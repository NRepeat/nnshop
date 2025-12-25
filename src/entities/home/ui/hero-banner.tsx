import Image from 'next/image';
import { Button } from '@shared/ui/button';

const LeftImage = `${process.env.BLOB_BASE_URL}/assests/home/image/home-banner/hero-banner-left.png`;

export const HeroBanner = () => {
  return (
    <div className="hero-banner relative">
      <Image
        src={LeftImage}
        alt=""
        className=" object-cover w-full max-h-[598px] md:max-h-[70vh]"
        width={375}
        height={598}
      />
      <div className="absolute bottom-16 left-[32px] w-fit flex flex-col gap-5">
        <p className="text-white text-xl  font-sans font-400 md:text-3xl">
          Elevate Your Style <br /> Timeless Fashion,
          <br className="md:hidden" /> Sustainable <br className="md:hidden" />{' '}
          Choices
        </p>
        <Button className="w-[120px] md:w-[220px]" variant={'secondary'}>
          Shop now
        </Button>
      </div>
    </div>
  );
};
