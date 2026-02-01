import { HEADER_QUERYResult } from '@shared/sanity/types';
import { PersistLinkNavigation } from '../navigation/ui/PersistLinkNavigation';
import MenuSheet from '../navigation/ui/Sheet';
import { SearchSession } from '../search/ui/search-session';

type HeaderContentProps = Extract<
  NonNullable<HEADER_QUERYResult>['header'],
  { _type: 'header' }
> & {
  locale: string;
};

export const HeaderContent = async (props: HeaderContentProps) => {
  const { locale, mainCategory } = props;

  return (
    <>
      <div className="justify-start w-full items-center hidden md:flex flex-row">
        {mainCategory && <PersistLinkNavigation {...props} />}
      </div>
      <div className="md:hidden flex items-center gap-2">
        <MenuSheet locale={locale} />
        <SearchSession className="h-full block md:hidden" />
      </div>
    </>
  );
};
