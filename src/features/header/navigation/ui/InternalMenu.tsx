'use client';
import { Maybe } from '@shared/lib/shopify/types/storefront.types';
import clsx from 'clsx';
import { ArrowLeftFromLine } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const InternalMenu = ({
  meinMenu,
}: {
  meinMenu: {
    id: Maybe<string> | undefined;
    title: string;
    url: string;
    items: {
      id: Maybe<string> | undefined;
      title: string;
      url: string;
    }[];
  }[];
}) => {
  const [activeTab, setActiveTab] = useState<undefined | number>();
  const navigate = useRouter();
  const handleActiveTab = (index: number) => {
    if (index === activeTab) {
      setActiveTab(undefined);
    } else {
      setActiveTab(index);
    }
  };
  const menu = meinMenu.map((item, index) => (
    <div
      className={clsx(
        'text-sm py-4 px-4 hover:bg-accent flex justify-between items-center cursor-pointer',
        {
          'hidden ': (activeTab || activeTab === 0) && index !== activeTab,
          'bg-accent': index === activeTab,
        },
      )}
      onClick={() =>
        item.items.length > 0 ? handleActiveTab(index) : navigate.push(item.url)
      }
      key={item.title + index}
    >
      {item.title}
      <ArrowLeftFromLine
        className={clsx('w-4 h-4', {
          hidden: !activeTab && index !== activeTab,
        })}
      />
    </div>
  ));
  const tabs = meinMenu.map((item, index) => (
    <div
      key={item.title + index}
      className={`text-sm  px-4 flex flex-col ${activeTab === index ? 'block' : 'hidden'}`}
    >
      {item.items.length > 0 &&
        item.items.map((subItem) => (
          <Link key={subItem.title} href={subItem.url}>
            <p className="text-sm py-4 px-4 hover:bg-accent">{subItem.title}</p>
          </Link>
        ))}
    </div>
  ));
  return (
    <div className="flex flex-col space-y-2">
      {menu}
      {tabs}
    </div>
  );
};
