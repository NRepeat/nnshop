import { LocalizedString } from '../types';
import { isLocalizedString } from './checkLocaliztionType';

export const getLocalizedString = (
  value: string | LocalizedString | undefined | null,
  locale: string,
): string | undefined => {
  if (isLocalizedString(value)) {
    return value[locale as keyof LocalizedString];
  }
  return value ?? undefined;
};
