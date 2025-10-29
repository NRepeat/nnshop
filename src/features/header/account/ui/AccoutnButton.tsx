import { auth } from '@features/auth/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui/avatar';
import { Button } from '@shared/ui/button';
import { User } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';

export const AccountButton = async () => {
  const headersList = await headers();

  const session = await auth.api.getSession({ headers: headersList });
  if (!session) {
    return (
      <Button
        variant="ghost"
        className="h-7.5 w-7.5 p-0 ring-5 ring-black rounded-full"
      >
        <Link href={'/auth/sign-in'}>
          <User className="h-7 w-7" />
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="ml-2">
        <p className="text-sm font-medium leading-none">{session.user.name}</p>
        <p className="text-sm text-muted-foreground">{session.user.email}</p>
      </div>
    </div>
  );
};
