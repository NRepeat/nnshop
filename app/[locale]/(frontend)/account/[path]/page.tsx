import { accountViewPaths } from '@daveyplate/better-auth-ui/server';
import { SettingsPageLayout } from '@/components/navigation/settings-nav';
import { getTranslations } from 'next-intl/server';
import { getPageInfo, renderView } from '@/features/account/ui/account-views';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }));
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  const t = await getTranslations('Settings.pages');
  const tBetterAuth = await getTranslations('BetterAuthUI');
  const { title, description } = getPageInfo(path, t);

  return (
    <SettingsPageLayout title={title} description={description}>
      {renderView(path, tBetterAuth)}
    </SettingsPageLayout>
  );
}
