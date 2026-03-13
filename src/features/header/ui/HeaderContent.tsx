import { HEADER_QUERYResult } from '@shared/sanity/types';
import { PersistLinkNavigation } from '../navigation/ui/PersistLinkNavigation';
import MenuSheet from '../navigation/ui/Sheet';
import { SearchSession } from '../search/ui/search-session';
import type { NavDropdowns } from '../navigation/ui/Sheet';

type HeaderContentProps = Extract<
  NonNullable<HEADER_QUERYResult>['header'],
  { _type: 'header' }
> & {
  locale: string;
  navDropdowns?: NavDropdowns | null;
};

export const HeaderContent = async (props: HeaderContentProps) => {
  const { locale, mainCategory, navDropdowns } = props;

  return (
    <>
      <div className="justify-start w-full items-center hidden md:flex flex-row">
        {mainCategory && <PersistLinkNavigation {...props} />}
      </div>
      <div className="md:hidden flex items-center gap-2">
        <MenuSheet locale={locale} mainCategory={mainCategory} navDropdowns={navDropdowns} />
        <SearchSession className="h-full block md:hidden" />
      </div>
    </>
  );
};
