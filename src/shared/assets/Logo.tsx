import imageLogo from '@shared/assets/mioMio.png';
import Image from 'next/image';

const Logo = (props: { className?: string }) => (
  <Image
    src={imageLogo}
    alt="Logo"
    width={150}
    height={150}
    className={props.className}
  />
);

export default Logo;
