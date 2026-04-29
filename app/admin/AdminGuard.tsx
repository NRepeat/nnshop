import { redirect } from 'next/navigation';
import { getAdminSession } from '@features/auth/lib/is-admin';
import { AppSidebar } from '@/components/app-sidebar';

export async function AdminGuard() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/auth/sign-in?next=/admin/bonuses');
  }

  return <AppSidebar email={session.user.email} variant="inset" />;
}
