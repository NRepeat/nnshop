import { AccountView } from '@daveyplate/better-auth-ui';
import { accountViewPaths } from '@daveyplate/better-auth-ui/server';
import { SettingsPageLayout } from '@/components/navigation/settings-nav';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }));
}

const getPageInfo = (path: string, t: (key: string) => string) => {
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

const renderView = (path: string) => {
  switch (path) {
    case 'settings':
      return <AccountView path={path} hideNav />;
    case 'security':
      return <AccountView path={path} hideNav />;
    default:
      return notFound();
  }
};

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  const t = await getTranslations('Settings.pages');
  const { title, description } = getPageInfo(path, t);

  return (
    <SettingsPageLayout title={title} description={description}>
      <AccountView
        path={path}
        hideNav
        localization={localization(tBetterAuth)}
      />
    </SettingsPageLayout>
  );
}
