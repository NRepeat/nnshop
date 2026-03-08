import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { PostHogIdentifyClient } from './PostHogIdentifyClient';

export async function PostHogIdentify() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.isAnonymous) return null;

  return (
    <PostHogIdentifyClient
      userId={session.user.id}
      email={session.user.email}
      name={session.user.name}
    />
  );
}
