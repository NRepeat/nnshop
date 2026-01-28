import { cookies } from 'next/headers';
import { Link } from '@shared/i18n/navigation';
import Image from 'next/image';

interface LogoLinkProps {
  iconUrl: string;
  alt?: string;
}

export const LogoLink = async ({ iconUrl, alt = 'Logo' }: LogoLinkProps) => {
  const cookieStore = await cookies();
  const gender = cookieStore.get('gender')?.value || 'woman';

  return (
    <Link href={`/${gender}`} className="flex items-center justify-center">
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
