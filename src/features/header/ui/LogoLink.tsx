import { headers } from 'next/headers';
import Link from 'next/link';
import { DEFAULT_GENDER } from '@shared/config/shop';
import MainLogo from './LogoSvg';

interface LogoLinkProps {
  alt?: string;
  locale: string;
}

export const LogoLink = async ({
  alt = 'Logo',
  locale,
}: LogoLinkProps) => {
  const headersList = await headers();
  const gender = headersList.get('x-gender') || DEFAULT_GENDER;
  return (
    <Link
      href={'/' + locale + '/' + gender}
      className="flex items-center justify-center"
      title={alt}
    >
      <div className="flex justify-center w-full items-center">
        <MainLogo 
          className="h-12 w-auto" 
          style={{ imageRendering: '-webkit-optimize-contrast' }}
          aria-label={alt}
        />
      </div>
    </Link>
  );
};
