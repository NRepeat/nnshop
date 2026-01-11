import { HEADER_QUERYResult } from '@shared/sanity/types';
import { PersistLinkNavigation } from '../navigation/ui/PersistLinkNavigation';
import Image from 'next/image';
import { urlFor } from '@shared/sanity/lib/image';
import { HeaderOptions } from './HeaderOptions';
import { Link } from '@shared/i18n/navigation';
import CartSheet from '../cart/ui/Sheet';
import NavigationSheet from '../navigation/ui/NavigationSheet';
import MenuSheet from '../navigation/ui/Sheet';
import { SearchSession } from '../search/ui/search-session';

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
      <div className="w-full  font-sans text-foreground grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 text-base  py-3">
        <div className=" justify-start w-full items-center hidden md:flex flex-row">
          {mainCategory && <PersistLinkNavigation {...props} />}
        </div>
        <div className="md:hidden flex items-center gap-2">
          <MenuSheet />
          <SearchSession className="h-full block md:hidden" />
        </div>

        <Link href="/" className="flex items-center justify-center">
          <div className="flex justify-center w-full items-center">
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
