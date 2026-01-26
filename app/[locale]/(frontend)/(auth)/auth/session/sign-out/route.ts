import { auth } from '@features/auth/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export default async function GET(request: NextRequest) {
  const headers = request.headers;
  await auth.api.signOut({ headers: headers });

  return NextResponse.redirect(new URL('/', request.url));
}
