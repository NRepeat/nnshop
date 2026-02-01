import Image from 'next/image';
import Link from 'next/link';

interface LogoLinkProps {
  iconUrl: string;
  alt?: string;
}

export const LogoLink = ({ iconUrl, alt = 'Logo' }: LogoLinkProps) => {
  return (
    <Link href={'/'} className="flex items-center justify-center">
      <div className="flex justify-center w-full items-center">
        <Image
          src={iconUrl}
          width={304}
          height={24}
          alt={alt}
          className="w-full h-full max-w-[180px]"
        />
      </div>
    </Link>
  );
};
