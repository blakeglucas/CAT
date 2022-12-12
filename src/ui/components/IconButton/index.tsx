import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

type Props = {
  children?: React.ReactNode;
} & React.HTMLProps<HTMLButtonElement>;

export const IconButton = React.forwardRef(function (
  props: Props,
  ref: React.Ref<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      {...props}
      type={props.type as 'button' | 'submit' | 'reset'}
      className={twMerge(
        clsx(
          'hover:shadow hover:bg-neutral-500 hover:cursor-pointer border rounded transition-colors border-neutral-400 text-white disabled:bg-neutral-700 disabled:cursor-default disabled:transition-none disabled:border-neutral-500 disabled:text-neutral-400',
          props.className
        )
      )}>
      {props.children}
    </button>
  );
});
