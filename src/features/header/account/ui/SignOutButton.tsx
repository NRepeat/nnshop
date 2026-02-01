'use client';

import { authClient } from '@features/auth/lib/auth-client';
import { DropdownMenuItem } from '@shared/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const SignOutButton = () => {
  const t = useTranslations('AccountButton');

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  return (
    <DropdownMenuItem
      className="text-red-600 focus:text-red-600 cursor-pointer"
      onClick={handleSignOut}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>{t('signOut')}</span>
    </DropdownMenuItem>
  );
};
