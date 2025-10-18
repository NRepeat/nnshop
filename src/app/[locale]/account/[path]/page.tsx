import { AccountView } from '@daveyplate/better-auth-ui';
import { accountViewPaths } from '@daveyplate/better-auth-ui/server';
import { SettingsPageLayout } from '@/components/navigation/settings-nav';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }));
}

const getPageInfo = (path: string) => {
  switch (path) {
    case 'settings':
      return {
        title: 'Profile Settings',
        description: 'Manage your personal information and preferences',
      };
    case 'security':
      return {
        title: 'Security',
        description:
          'Manage your password, two-factor authentication, and sessions',
      };
    default:
      return {
        title: 'Account Settings',
        description: 'Manage your account configuration',
      };
  }
};

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  const { title, description } = getPageInfo(path);

  return (
    <SettingsPageLayout title={title} description={description}>
      <AccountView path={path} hideNav />
    </SettingsPageLayout>
  );
}
