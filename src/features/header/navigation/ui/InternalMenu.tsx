'use client';
import { Maybe } from '@shared/lib/shopify/types/storefront.types';
import clsx from 'clsx';
import { ArrowLeftFromLine, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from '@shared/i18n/navigation';
import { useState } from 'react';
import { cookieFenderSet } from '../api/setCookieGender';
import { Button } from '@shared/ui/button';
export const InternalMenu = ({
  meinMenu,
  currentGender,
  onClose,
}: {
  meinMenu: {
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
  }[][];
  currentGender: string;
  onClose: () => void;
}) => {
  const [activeGender, setActiveGender] = useState<number>(
    currentGender === 'men' ? 0 : 1,
  );
  const [activeSubTab, setActiveSubTab] = useState<undefined | number>();
  const navigate = useRouter();

  const handleGenderChange = async (index: number) => {
    await cookieFenderSet(index === 0 ? 'men' : 'women');
    setActiveGender(index);
    setActiveSubTab(undefined);
  };

  const handleActiveSubTab = (index: number) => {
    if (index === activeSubTab) {
      setActiveSubTab(undefined);
    } else {
      setActiveSubTab(index);
    }
  };

  const tabs = meinMenu[activeGender]?.map((item, index) => (
    <div
      key={item.title + index}
      className={`text-sm px-4 flex flex-col overflow-auto`}
    >
      {item.items.map((subItem, subIndex) => (
        <div
          key={subItem.title}
          onClick={() => {
            if (subItem.items.length > 0) {
              handleActiveSubTab(subIndex);
            } else {
              navigate.push(subItem.url);
              onClose();
            }
          }}
        >
          <div
            className={clsx(
              'text-sm py-4 px-4 hover:bg-accent flex justify-between items-center cursor-pointer',
              {
                'hidden ':
                  (activeSubTab || activeSubTab === 0) &&
                  subIndex !== activeSubTab,
                'bg-accent': subIndex === activeSubTab,
              },
            )}
          >
            <p>{subItem.title}</p>
            <ArrowLeftFromLine
              className={clsx('w-4 h-4', {
                hidden: !activeSubTab && subIndex !== activeSubTab,
              })}
            />
          </div>
          {subItem.items.length > 0 && (
            <div
              className={`text-sm px-4 flex flex-col overflow-auto ${activeSubTab === subIndex ? 'block' : 'hidden'}`}
            >
              {subItem.items.map((subSubItem) => (
                <Link
                  key={subSubItem.title}
                  href={subSubItem.url}
                  onClick={() => onClose()}
                >
                  <p className="text-sm py-4 px-4 hover:bg-accent">
                    {subSubItem.title}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  ));
  const mainMenu = [
    { label: 'Жінки' },
    { label: 'Чоловіки' },
    { label: 'Нові надходження' },
  ];
  return (
    <div className="flex flex-col  px-4 py-8 font-sans h-full">
      <div className="flex flex-col gap-1">
        {mainMenu.map((item, index) => (
          <Button
            key={item.label}
            className={clsx(
              'justify-between  py-4 font-300  border-t border-muted h-12',
            )}
            onClick={() => handleGenderChange(index)}
            variant="ghost"
          >
            <p className="">{item.label}</p>
            <div className="flex items-center">
              {true ? (
                <Minus className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
