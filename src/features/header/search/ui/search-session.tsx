import { SearchClient } from './search-client';

export const SearchSession = ({ className }: { className?: string }) => {
  return <SearchClient className={className} />;
};
