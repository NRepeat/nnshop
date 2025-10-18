'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Shield, User, ChevronRight } from 'lucide-react';

const settingsNavItems = [
  {
    title: 'Profile',
    href: '/account/settings',
    icon: User,
    description: 'Personal information and preferences',
  },
  {
    title: 'Security',
    href: '/account/security',
    icon: Shield,
    description: 'Password, 2FA, and session management',
  },
];

interface SettingsNavProps {
  className?: string;
  variant?: 'sidebar' | 'breadcrumb' | 'tabs';
}

export function SettingsNav({
  className,
  variant = 'sidebar',
}: SettingsNavProps) {
  const pathname = usePathname();

  if (variant === 'breadcrumb') {
    const currentItem = settingsNavItems.find((item) => item.href === pathname);

    return (
      <nav
        className={cn(
          'flex items-center space-x-2 text-sm text-muted-foreground',
          className,
        )}
      >
        <Link
          href="/settings"
          className="hover:text-foreground transition-colors"
        >
          Settings
        </Link>
        {currentItem && currentItem.href !== '/settings' && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">
              {currentItem.title}
            </span>
          </>
        )}
      </nav>
    );
  }

  if (variant === 'tabs') {
    return (
      <nav className={cn('flex space-x-6 border-b', className)}>
        {settingsNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 py-2 px-1 border-b-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  // Default sidebar variant
  return (
    <nav className={cn('space-y-1', className)}>
      {settingsNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-start space-x-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )}
          >
            <item.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {item.description}
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export function SettingsPageLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <SettingsNav variant="breadcrumb" className="mb-4" />
          {title && (
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-2">{description}</p>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Settings</h2>
              <SettingsNav />
            </div>
          </aside>

          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
