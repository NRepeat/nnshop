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
};

type ChildItem = {
  title: string;
  url: string;
  collectionImageUrl?: string | null;
};

type Column = {
  title: string;
  url: string;
  items: ChildItem[];
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

  return (
    <div className="flex gap-10 px-6 w-full py-8 justify-center">
      {columns.map((col, colIdx) => (
        <div key={col.title + colIdx} className="flex-1 min-w-[180px] max-w-[260px]">
          <NavigationItemClient href={col.url} className="block mb-3">
            <p className="text-base font-semibold tracking-wide border-b border-border pb-2">
              {col.title}
            </p>
          </NavigationItemClient>
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
                <NavigationItemClient href={item.url} className="w-full rounded">
                  <Button
                    variant="ghost"
                    className="group-hover:underline duration-300 decoration-transparent hover:decoration-primary transition-all text-base font-normal font-sans w-full justify-start px-2 border-none min-h-10 rounded"
                  >
                    {item.title}
                  </Button>
                </NavigationItemClient>
              </li>
            ))}
          </ul>
          {colIdx === 0 && (
            <div className="mt-4">
              <NavigationItemClient href={col.url}>
                <Button variant="outline" className="text-sm">
                  {col.title}
                </Button>
              </NavigationItemClient>
            </div>
          )}
        </div>
      ))}

      {defaultImage && displayImageUrl && (
        <div className="shrink-0 w-[300px] flex flex-col gap-3 mr-10">
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
          {(defaultImage.imageTitle || defaultImage.alt) && (
            <p className="text-sm text-muted-foreground">
              {defaultImage.imageTitle ?? defaultImage.alt}
            </p>
          )}
          {defaultImage.imageButtonLabel && (
            <NavigationItemClient href={defaultImage.href}>
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
