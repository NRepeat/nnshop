import { auth } from '@features/auth/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';
import { User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import Link from 'next/link';

export const AccountButton = async () => {
  const headersList = await headers();
  const t = await getTranslations('AccountButton');

  const session = await auth.api.getSession({ headers: headersList });
  if (!session) {
    return (
      <Link
        href={'/auth/sign-in'}
        className="cursor-pointer block hover:bg-accent p-2 rounded-none"
      >
        <User />
      </Link>
    );
  }
  if (session && session.user?.isAnonymous) {
    return (
      <Link
        href={'/auth/sign-in'}
        className="cursor-pointer block hover:bg-accent p-2 rounded-none"
      >
        <User />
      </Link>
    );
  }
  return (
    <div className="flex items-center ">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center cursor-pointer">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="ml-2 hidden md:block ">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            {/*<p className="text-sm text-muted-foreground">{session.user.email}</p>*/}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/orders">{t('orders')}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>{t('favorites')}</DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/account/settings">{t('settings')}</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
