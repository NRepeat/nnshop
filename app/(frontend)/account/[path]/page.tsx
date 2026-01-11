import { accountViewPaths } from '@daveyplate/better-auth-ui/server';
import { SettingsPageLayout } from '@/widgets/settings-nav';
import { getTranslations } from 'next-intl/server';
import { getPageInfo, renderView } from '@/features/account/ui/account-views';

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }));
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string; locale: string }>;
}) {
  return <></>;
  const { path, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Settings.pages' });
  const tBetterAuth = await getTranslations({ locale, namespace: 'BetterAuthUI' });
  const { title, description } = getPageInfo(path, t);

  return (
    <div className="mt-10">
      <SettingsPageLayout title={title} description={description}>
        {renderView(path, tBetterAuth)}
      </SettingsPageLayout>
    </div>
  );
}
