// import { getTranslations } from "next-intl/server";

import Link from 'next/link';

export const AnnouncementBar = async () => {
  // const t = await getTranslations()
  return (
    <div className="w-full  font-sans bg-foreground text-background ">
      <Link href={'/'}>
        <p className=" w-full items-center justify-center py-3 font-400 hidden md:flex text-xs ">
          Complimentary U.S. No-Rush Shipping on orders of $95 or more. Shop now
        </p>
        <p className=" w-full items-center justify-center py-3 text-xs font-400 flex md:hidden">
          The Archive Sale is live. Starting at 20% off. Shop now.
        </p>
      </Link>
    </div>
  );
};
