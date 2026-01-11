import { auth } from '@features/auth/lib/auth';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';
import { User2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { Button } from '@shared/ui/button';
import { cn } from '@shared/lib/utils';

const AccountButtonContent = ({ className }: { className: string }) => {
  return (
    <Link href={'/auth/sign-in'} className="rounded-none">
      <Button variant="ghost" size="icon" className={cn(className)}>
        <User2 />
      </Button>
    </Link>
  );
};

export const AccountButton = async ({
  className,
  locale,
}: {
  className?: string;
  locale: string;
}) => {
  const headersList = await headers();
  const t = await getTranslations({ locale, namespace: 'AccountButton' });

  const session = await auth.api.getSession({ headers: headersList });
  if (!session) {
    return <AccountButtonContent className={cn(className)} />;
  }
  if (session && session.user?.isAnonymous) {
    return <AccountButtonContent className={cn(className)} />;
  }
  return (
    <div className="flex items-center ">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(className, 'flex items-center cursor-pointer')}
        >
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
          <DropdownMenuItem>
            <Link href="/favorites">{t('favorites')}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/account/settings">{t('settings')}</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
