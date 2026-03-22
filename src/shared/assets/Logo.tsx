import imageLogo from '@shared/assets/mioMio.png';
import Image from 'next/image';

const Logo = (props: { className?: string }) => (
  <Image
    src={imageLogo}
    alt="MioMio"
    width={150}
    height={150}
    unoptimized
    className={props.className}
  />
);

export default Logo;
