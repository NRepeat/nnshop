'use client';
import { FC, HTMLAttributes } from 'react';
import NovaPoshtaButton from './NovaPoshtaButton';

const NovapostForm: FC<
  HTMLAttributes<HTMLHeadingElement> & { privateKey: string }
> = () => {
  return (
    <form className="flex flex-col  w-full gap-2.5">
      <NovaPoshtaButton className="w-full max-w-[700px]" />
    </form>
  );
};
export default NovapostForm;
