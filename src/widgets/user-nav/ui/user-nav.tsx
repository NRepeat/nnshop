'use client';

import { UserButton, UserAvatar } from '@daveyplate/better-auth-ui';
import { client } from '@/features/auth/lib/client';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Settings, User, Shield, Key, Building2, LogOut } from 'lucide-react';
import { Link } from '@shared/i18n/navigation';
export function UserNav() {
  const { data: session } = client.useSession();

  if (!session) {
    return (
      <div className="flex items-center space-x-2">
        <Button asChild variant="ghost">
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    );
  }

  const handleSignOut = async () => {
    await client.signOut();
    window.location.href = '/';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <UserAvatar className="h-8 w-8" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name || session.user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account/settings" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account/security" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            <span>Security</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account/api-keys" className="flex items-center">
            <Key className="mr-2 h-4 w-4" />
            <span>API Keys</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account/organizations" className="flex items-center">
            <Building2 className="mr-2 h-4 w-4" />
            <span>Organizations</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Alternative using the built-in UserButton component
export function SimpleUserNav() {
  return (
    <div className="flex items-center space-x-4">
      <UserButton />
    </div>
  );
}

// For cases where you want to show authentication state
export function AuthStateNav() {
  const { data: session, isPending } = client.useSession();

  if (isPending) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!session) {
    return (
      <div className="flex items-center space-x-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return <UserNav />;
}
