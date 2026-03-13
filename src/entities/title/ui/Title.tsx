import { PropsWithChildren } from 'react';

export function Title(props: PropsWithChildren) {
  return (
    <h1 className="text-2xl md:text-4xl lg:text-4xl font-semibold text-slate-800 text-pretty ">
      {props.children}
    </h1>
  );
}
