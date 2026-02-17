import { AccountView } from '@daveyplate/better-auth-ui';
import { localization } from '@/shared/i18n/localization/account';
import { notFound } from 'next/navigation';

export const getPageInfo = (path: string, t: (key: string) => string) => {
  switch (path) {
    case 'settings':
      return {
        title: t('profileSettings'),
        description: t('profileDescription'),
      };
    case 'security':
      return {
        title: t('securitySettings'),
        description: t('securityDescription'),
      };
    default:
      return {
        title: t('profileSettings'),
        description: t('profileDescription'),
      };
  }
};

export const renderView = (
  path: string,
  tBetterAuth: (key: string) => string,
) => {
  switch (path) {
    case 'settings':
      return (
        <AccountView
          path={path}
          hideNav
          localization={localization(tBetterAuth)}
        />
      );
    default:
      return notFound();
  }
};
