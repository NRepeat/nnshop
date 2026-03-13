'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@shared/ui/button';
import { NavigationItemClient } from './NavigationItemClient';

type DefaultImage = {
  imageUrl: string;
  imageWidth?: number | null;
  imageHeight?: number | null;
  href: string;
  alt: string;
  imageTitle?: string | null;
  imageButtonLabel?: string | null;
  imageButtonUrl?: string | null;
};

const NAV_COLOR_MAP: Record<string, string> = {
  red: 'text-red-500',
  orange: 'text-orange-500',
  green: 'text-green-600',
  blue: 'text-blue-600',
};

type ChildItem = {
  title: string;
  url: string;
  isDuplicate?: boolean;
  collectionImageUrl?: string | null;
  navTitleColor?: string | null;
};

type Column = {
  title: string;
  url: string;
  items: ChildItem[];
  outletLink?: { label?: string | null; url?: string | null } | null;
  actionButton?: { label?: string | null; url?: string | null } | null;
};

export function NavDropdownContent({
  columns,
  defaultImage,
  gender,
}: {
  columns: Column[];
  defaultImage?: DefaultImage | null;
  gender: string;
}) {
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  const displayImageUrl = activeImageUrl ?? defaultImage?.imageUrl ?? null;

  const processedColumns = columns.flatMap((col) => {
    if (col.items.length <= 6) return [col];

    const half = Math.ceil(col.items.length / 2);

    return [
      {
        ...col,
        items: col.items.slice(0, half),
        outletLink: null,
        actionButton: null,
      },
      { ...col, items: col.items.slice(half), title: '' },
    ];
  });

  return (
    <div className="flex gap-10 px-6 w-full py-8 items-start justify-between  max-w-6xl ">
      {processedColumns.map((col, colIdx) => (
        <div
          key={`${col.title}-${colIdx}`}
          className="flex-1 min-w-[180px] max-w-[260px]"
        >
          {col.title ? (
            col.url ? (
              <NavigationItemClient href={col.url} className="block mb-3 px-4">
                <p className="text-base font-semibold tracking-wide border-b border-border pb-2">
                  {col.title}
                </p>
              </NavigationItemClient>
            ) : (
              <NavigationItemClient className="block mb-3 px-4">
                <p className="text-base font-semibold tracking-wide border-b border-border pb-2">
                  {col.title}
                </p>
              </NavigationItemClient>
            )
          ) : (
            <div className="block mb-3 py-2 px-2">
              <p className="text-base font-semibold tracking-wide border-b border-border pb-2 invisible">
                Spacer
              </p>
            </div>
          )}
          <ul
            className="flex flex-col gap-0.5"
            onMouseLeave={() => setActiveImageUrl(null)}
          >
            {col.items.map((item) => (
              <li
                key={item.title + gender}
                className="w-full group rounded hover:shadow hover:bg-secondary/50 transition-colors duration-200"
                onMouseEnter={() =>
                  setActiveImageUrl(item.collectionImageUrl ?? null)
                }
              >
                {item.isDuplicate ? (
                  <span className="w-full rounded px-0 block opacity-50 cursor-default">
                    <Button
                      variant="ghost"
                      className="text-base font-normal font-sans w-full justify-start px-4 border-none rounded"
                      disabled
                    >
                      {item.title}
                    </Button>
                  </span>
                ) : (
                  <NavigationItemClient
                    className="w-full rounded px-0"
                    href={item.url}
                  >
                    <Button
                      variant="ghost"
                      className="group-hover:underline duration-300 decoration-transparent  hover:decoration-primary transition-all text-base font-normal font-sans w-full justify-start px-4 border-none rounded"
                    >
                      {item.title}
                    </Button>
                  </NavigationItemClient>
                )}
              </li>
            ))}
          </ul>
          {col.outletLink?.label && (
            <div className="mt-1 border-t border-border pt-1">
              <div className="w-full group rounded hover:shadow hover:bg-secondary/50 transition-colors duration-200">
                <NavigationItemClient
                  href={col.outletLink.url ?? col.url}
                  className="block w-full rounded p-0"
                >
                  <Button
                    variant="ghost"
                    className="group-hover:underline  px-4 h-12 duration-300 decoration-transparent hover:decoration-primary transition-all text-base font-normal font-sans w-full justify-start border-none min-h-10 rounded text-red-500"
                  >
                    {col.outletLink.label}
                  </Button>
                </NavigationItemClient>
              </div>
            </div>
          )}
          {col.actionButton?.label && (
            <div className="mt-4">
              <NavigationItemClient href={col.actionButton.url ?? col.url}>
                <Button variant="outline" className="text-sm">
                  {col.actionButton.label}
                </Button>
              </NavigationItemClient>
            </div>
          )}
        </div>
      ))}

      {defaultImage && displayImageUrl && (
        <div className="shrink-0 w-[300px]  flex flex-col gap-3 mr-10">
          <NavigationItemClient
            href={defaultImage.href}
            className="block rounded overflow-hidden"
          >
            <Image
              src={displayImageUrl}
              alt={defaultImage.alt}
              width={defaultImage.imageWidth ?? 300}
              height={defaultImage.imageHeight ?? 380}
              className="object-cover w-full h-full rounded transition-opacity duration-200"
            />
          </NavigationItemClient>
          {defaultImage.imageButtonLabel && (
            <NavigationItemClient
              href={defaultImage.imageButtonUrl ?? defaultImage.href}
            >
              <Button variant="outline" className="text-sm w-full">
                {defaultImage.imageButtonLabel}
              </Button>
            </NavigationItemClient>
          )}
        </div>
      )}
    </div>
  );
}
