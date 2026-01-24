import { HEADER_QUERYResult } from '@shared/sanity/types';
import { PersistLinkNavigation } from '../navigation/ui/PersistLinkNavigation';
import { HeaderOptions } from './HeaderOptions';
import MenuSheet from '../navigation/ui/Sheet';
import { SearchSession } from '../search/ui/search-session';

type HeaderContentProps = Extract<
  NonNullable<HEADER_QUERYResult>['header'],
  { _type: 'header' }
> & {
  locale: string;
};

export const HeaderContent = async (
  props: HeaderContentProps & {
    childern?: React.ReactNode;
  },
) => {
  const { locale, mainCategory, childern } = props;

  return (
    <div className="container w-full ">
      <div className="w-full  font-sans text-foreground grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 text-base  py-3">
        <div className=" justify-start w-full items-center hidden md:flex flex-row">
          {mainCategory && <PersistLinkNavigation {...props} />}
        </div>
        <div className="md:hidden flex items-center gap-2">
          <MenuSheet locale={locale} />
          <SearchSession className="h-full block md:hidden" />
        </div>
        {childern}

        <HeaderOptions locale={locale} />
      </div>
      <div className=" justify-center w-full items-center  flex md:hidden flex-row pb-1">
        {mainCategory && <PersistLinkNavigation {...props} />}
      </div>
    </div>
  );
};
