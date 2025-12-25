'use client';
import { Maybe } from '@shared/lib/shopify/types/storefront.types';
import clsx from 'clsx';

import Link from 'next/link';

import { useState } from 'react';
import { cookieFenderSet } from '../api/setCookieGender';
import { Button } from '@shared/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
import { useRouter } from 'next/navigation';
export const InternalMenu = ({
  meinMenu,
  onClose,
}: {
  meinMenu: {
    label: string;
    menu: {
      id: Maybe<string> | undefined;
      title: string;
      url: string;
      items: {
        id: Maybe<string> | undefined;
        title: string;
        url: string;
        items: {
          id: Maybe<string> | undefined;
          title: string;
          url: string;
        }[];
      }[];
    }[];
  }[];
  onClose: () => void;
}) => {
  const navigate = useRouter();

  const tabs = meinMenu.map((item) => (
    <div
      key={item.label}
      className={`text-sm px-4 flex flex-col overflow-auto`}
    >
      <AccordionTrigger>{item.label}</AccordionTrigger>
      <AccordionContent>
        {item.menu.map((subItem) =>
          subItem.items.length > 0 ? (
            <AccordionItem value={subItem.title} key={subItem.id}>
              <AccordionTrigger>{subItem.title}</AccordionTrigger>
              <AccordionContent>
                {subItem.items.map((subSubItem) => (
                  <Link
                    key={subSubItem.id}
                    href={subSubItem.url}
                    onClick={() => onClose()}
                  >
                    <p className="text-sm py-4 px-4 hover:bg-accent">
                      {subSubItem.title}
                    </p>
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          ) : (
            <div
              key={subItem.id}
              onClick={() => {
                navigate.push(subItem.url);
                onClose();
              }}
            >
              <div
                className={clsx(
                  'text-sm py-4 px-4 hover:bg-accent flex justify-between items-center cursor-pointer',
                )}
              >
                <p>{subItem.title}</p>
              </div>
            </div>
          ),
        )}
      </AccordionContent>
    </div>
  ));
  return (
    <div className="flex flex-col  px-4 py-8 font-sans h-full">
      {/*<div className="flex flex-col gap-1">
        {mainMenu.map((item, index) => (
          <Button
            key={item.label}
            className={clsx(
              'justify-between  py-4 font-300  border-t border-muted h-12',
            )}
            variant="ghost"
          >
            <p className="">{item.label}</p>
          </Button>
        ))}
      </div>*/}
      <Accordion type="single" collapsible className="w-full">
        {tabs}
      </Accordion>
    </div>
  );
};
