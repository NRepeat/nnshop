'use client';
import { Maybe } from '@shared/lib/shopify/types/storefront.types';
import Link from 'next/link';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
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
  onClose: (link: string) => void;
}) => {
  const tabs = meinMenu
    .filter((item) => item.menu.length > 0)
    .map((item) => {
      return (
        <div className="flex flex-col">
          {item.menu.map((subItem) => {
            const subId = `sub-${subItem.id || subItem.title}`;
            const hasSubItems = subItem.items && subItem.items.length > 0;
            return (
              <div key={subId} className="w-full h-full flex flex-col flex-1">
                {hasSubItems ? (
                  <AccordionItem
                    value={subItem.title}
                    className="border-none rounded-none py-0"
                  >
                    <AccordionTrigger className="rounded-none  py-4 font-300  border-t border-muted  hover:underline">
                      {subItem.title}
                    </AccordionTrigger>
                    <AccordionContent className="border-l border-foreground/10 py-4 mb-1 ">
                      {subItem.items.map((subSubItem) => {
                        const subSubId = `subsub-${subSubItem.id || subSubItem.title}`;
                        const hasGrandChildren =
                          subSubItem.items && subSubItem.items.length > 0;

                        return (
                          <div key={subSubId} className="w-full">
                            {hasGrandChildren ? (
                              <AccordionItem
                                value={subSubId}
                                className="border-none"
                              >
                                <AccordionTrigger
                                  value={subSubId}
                                  className="pl-4 py-4 text-sm font-normal  hover:underline"
                                >
                                  {subSubItem.title}
                                </AccordionTrigger>

                                <AccordionContent className="">
                                  {subSubItem.items.map((grandChild) => (
                                    <Link
                                      key={grandChild.id || grandChild.title}
                                      href={grandChild.url}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        console.log(
                                          'Navigating to:',
                                          grandChild.url,
                                        );
                                        onClose(grandChild.url);
                                      }}
                                      className="block"
                                    >
                                      <div className="pl-4  text-sm font-normal text-foreground/80  hover:underline ">
                                        <p className="border-l border-foreground/10 py-4 pl-3">
                                          {grandChild.title}
                                        </p>
                                      </div>
                                    </Link>
                                  ))}
                                </AccordionContent>
                              </AccordionItem>
                            ) : (
                              <Link
                                href={subSubItem.url}
                                onClick={(e) => {
                                  e.preventDefault();
                                  onClose(subSubItem.url);
                                }}
                                className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md text-left transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180 pl-4 py-4 text-sm font-normal hover:underline"
                              >
                                {subSubItem.title}
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                ) : (
                  <Link
                    href={subItem.url}
                    onClick={(e) => {
                      e.preventDefault();
                      onClose(subItem.url);
                    }}
                    className="pl-6 py-4 text-sm font-normal  hover:underline"
                  >
                    {subItem.title}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      );
    });
  return (
    <div className="flex flex-col  px-4 py-8 font-sans h-full flex-1 overflow-y-auto">
      <Accordion type="multiple" className="w-full  h-full flex-1  pr-1">
        {tabs}
      </Accordion>
    </div>
  );
};
