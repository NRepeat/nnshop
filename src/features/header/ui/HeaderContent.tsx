import { HEADER_QUERYResult } from '@shared/sanity/types';
import { PersistLinkNavigation } from '../navigation/ui/PersistLinkNavigation';
import Image from 'next/image';
import { urlFor } from '@shared/sanity/lib/image';
import { HeaderOptions } from './HeaderOptions';
import { Link } from '@shared/i18n/navigation';

type HeaderContentProps = Extract<
  NonNullable<HEADER_QUERYResult>['header'],
  { _type: 'header' }
> & {
  locale: string;
};

export const HeaderContent = async (props: HeaderContentProps) => {
  const { icon, locale, mainCategory } = props;
  return (
    <div className="container w-full ">
      <div className="w-full  font-sans text-foreground grid grid-cols-1 md:grid-cols-3 text-base  py-2">
        {mainCategory && <PersistLinkNavigation {...props} />}
        <Link href="/">
          <div className="flex justify-center w-full">
            {icon?.asset && (
              <Image
                src={urlFor(icon?.asset).url()}
                width={304}
                height={24}
                alt="Icon"
                className="w-full h-full max-w-[180px]"
              />
            )}
          </div>
        </Link>

        <HeaderOptions locale={locale} />
      </div>
    </div>
  );
};
