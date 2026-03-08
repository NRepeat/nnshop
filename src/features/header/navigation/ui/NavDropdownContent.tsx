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
};

type ChildItem = {
  title: string;
  url: string;
  collectionImageUrl?: string | null;
};

export function NavDropdownContent({
  children,
  defaultImage,
  gender,
}: {
  children: ChildItem[];
  defaultImage?: DefaultImage | null;
  gender: string;
}) {
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  const displayImageUrl = activeImageUrl ?? defaultImage?.imageUrl ?? null;

  return (
    <div
      className={`flex gap-10  px-6 w-full  py-8 flex justify-center    ${defaultImage ? 'justify-around' : ''}`}
    >
      <div className="flex-1 max-w-5xl">
        <ul
          className="grid grid-cols-2 gap-x-8 gap-y-1 w-full"
          onMouseLeave={() => setActiveImageUrl(null)}
        >
          {children.map((child) => (
            <li
              key={child.title + gender}
              className="w-full group rouded hover:shadow hover:bg-secondary/50 transition-colors duration-200"
              onMouseEnter={() =>
                setActiveImageUrl(child.collectionImageUrl ?? null)
              }
            >
              <NavigationItemClient href={child.url} className="w-full rounded">
                <Button
                  variant="ghost"
                  className="group-hover:underline duration-300 decoration-transparent hover:decoration-primary transition-all text-base font-normal font-sans w-full justify-start px-2 border-none min-h-10 rounded"
                >
                  {child.title}
                </Button>
              </NavigationItemClient>
            </li>
          ))}
        </ul>
      </div>

      {defaultImage && displayImageUrl && (
        <div className="shrink-0 w-[350px] max-h-[400px] py-0 relative mr-10">
          <NavigationItemClient
            href={activeImageUrl ? '#' : defaultImage.href}
            className="block h-full px-0 py-0 rounded   "
          >
            <Image
              src={displayImageUrl}
              alt={activeImageUrl ? '' : defaultImage.alt}
              width={defaultImage.imageWidth ?? 350}
              height={defaultImage.imageHeight ?? 460}
              className="object-cover w-full h-full rounded transition-opacity duration-200 "
            />
            <div className="pointer-events-none absolute inset-0 rounded inset-shadow-sm  "></div>
          </NavigationItemClient>
        </div>
      )}
    </div>
  );
}
