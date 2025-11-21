import React, { FC, HTMLAttributes } from 'react';
import { clsx } from 'clsx';
const ContainerHeader: FC<HTMLAttributes<HTMLHeadingElement>> = (props) => {
  return (
    <h2
      {...props}
      className={clsx(props.className, `font-istok-web font-bold`)}
    >
      {props.children}
    </h2>
  );
};

export default ContainerHeader;
