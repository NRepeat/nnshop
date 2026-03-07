'use client';
import { Maybe } from '@shared/lib/shopify/types/storefront.types';
import { Link } from '@shared/i18n/navigation';
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
  const allValues = meinMenu.flatMap((item, itemIndex) =>
    item.menu.flatMap((subItem, subIndex) => {
      const values = [];
      const subId = `sub-${subItem.id || subItem.title}-${subIndex}`;
      // Only add the very first subId to default open
      if (itemIndex === 0 && subIndex === 0 && subItem.items && subItem.items.length > 0) {
        values.push(subId);
      }
      return values;
    }),
  );

  const tabs = meinMenu
    .filter((item) => item.menu.length > 0)
    .map((item) => {
      return (
        <div key={item.label} className="flex flex-col">
          {item.menu.map((subItem, subIndex) => {
            const subId = `sub-${subItem.id || subItem.title}-${subIndex}`;
            const hasSubItems = subItem.items && subItem.items.length > 0;
            return (
              <div key={subId} className="w-full h-full flex flex-col flex-1 ">
                {hasSubItems ? (
                  <AccordionItem value={subId} className="border-none py-0">
                    <div className="flex items-center justify-between border-b border-foreground/10">
                      <Link
                        href={subItem.url}
                        onClick={(e) => {
                          e.preventDefault();
                          onClose(subItem.url);
                        }}
                        className="py-4 font-300 transition-colors text-lg flex-1"
                      >
                        {subItem.title}
                      </Link>
                      <AccordionTrigger className="py-4 !p-0 w-10 justify-center shrink-0 border-none" />
                    </div>
                    <AccordionContent className=" border-foreground/10 py-4 mb-1 ">
                      {subItem.items.map((subSubItem, subSubIndex) => {
                        const subSubId = `subsub-${subSubItem.id || subSubItem.title}-${subSubIndex}`;
                        const hasGrandChildren =
                          subSubItem.items && subSubItem.items.length > 0;

                        return (
                          <div key={subSubId} className="w-full">
                            {hasGrandChildren ? (
                              <AccordionItem
                                value={subSubId}
                                className="border-none"
                              >
                                <div className="flex items-center justify-between border-b border-foreground/5 pl-4">
                                  <Link
                                    href={subSubItem.url}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      onClose(subSubItem.url);
                                    }}
                                    className="py-4 font-normal text-lg flex-1"
                                  >
                                    {subSubItem.title}
                                  </Link>
                                  <AccordionTrigger className="py-4 !p-0 w-10 justify-center shrink-0 border-none" />
                                </div>

                                <AccordionContent className="">
                                  {subSubItem.items.map((grandChild) => (
                                    <Link
                                      key={grandChild.id || grandChild.title}
                                      href={grandChild.url}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        onClose(grandChild.url);
                                      }}
                                      className="block"
                                    >
                                      <div className="pl-4  text-base font-normal text-foreground/80  hover:border-b hover:border-current transition-colors ">
                                        <p className=" border-foreground/10 py-4 pl-3">
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
                                className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded text-left transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180 pl-4 py-4  font-normal  transition-colors text-lg"
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
                    className="pl-6 py-4 text-sm font-normal  hover:border-current transition-colors"
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
      <Accordion
        type="multiple"
        defaultValue={allValues}
        className="w-full  h-full flex-1  pr-1"
      >
        {tabs}
      </Accordion>
    </div>
  );
};
