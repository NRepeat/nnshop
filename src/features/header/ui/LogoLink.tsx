import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

interface LogoLinkProps {
  iconUrl: string;
  alt?: string;
  locale: string;
}

export const LogoLink = async ({
  iconUrl,
  alt = 'Logo',
  locale,
}: LogoLinkProps) => {
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || 'woman';
  return (
    <Link
      href={'/' + locale + '/' + gender}
      className="flex items-center justify-center"
    >
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
