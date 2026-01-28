import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const isValidPhone = (phone: string): boolean => {
  const phoneNumber = parsePhoneNumberFromString(phone);
  return phoneNumber?.isValid() || false;
};

export const formatPhoneE164 = (phone: string): string | null => {
  const phoneNumber = parsePhoneNumberFromString(phone);
  return phoneNumber?.isValid() ? phoneNumber.format('E.164') : null;
};
