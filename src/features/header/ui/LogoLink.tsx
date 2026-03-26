import MainLogo from './LogoSvg';
import { Link } from '@shared/i18n/navigation';

interface LogoLinkProps {
  alt?: string;
}

export const LogoLink = async ({ alt = 'Logo' }: LogoLinkProps) => {
  return (
    <Link href={'/'} className="flex items-center justify-center" title={alt}>
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
