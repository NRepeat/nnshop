'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@shared/ui/breadcrumb';

type BreadcrumbItem = {
  label: string;
  href: string;
  isCurrent?: boolean;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center ">
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && (
              <BreadcrumbSeparator className="px-2 pt-0.5" />
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
