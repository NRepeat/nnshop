import { LocalizedString } from '../types';
export const isLocalizedString = (
  value: string | LocalizedString | undefined | null,
): value is LocalizedString => {
  return typeof value === 'object' && value !== null;
};
