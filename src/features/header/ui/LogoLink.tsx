import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { DEFAULT_GENDER } from '@shared/config/shop';
import MainLogo from './LogoSvg';

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
  const gender = cookie.get('gender')?.value || DEFAULT_GENDER;
  return (
    <Link
      href={'/' + locale + '/' + gender}
      className="flex items-center justify-center"
    >
      <div className="flex justify-center w-full items-center">
        <MainLogo className="h-12 w-auto" style={{ imageRendering: '-webkit-optimize-contrast' }}/>
      </div>
    </Link>
  );
};
