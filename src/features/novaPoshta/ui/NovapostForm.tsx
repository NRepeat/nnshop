'use client';
import { FC, HTMLAttributes, ReactElement, useState } from 'react';
import NovaPoshtaButton from './NovaPoshtaButton';
import { createInvoice } from '../api/submit';

const NovapostForm: FC<
  HTMLAttributes<HTMLHeadingElement> & { privateKey: string }
> = (props) => {
  return (
    <form className="flex flex-col  w-full gap-2.5">
      <NovaPoshtaButton className="w-full max-w-[700px]" />
    </form>
  );
};
export default NovapostForm;
