import React from 'react';
import clsx from 'clsx';

type Props = {
  children?: React.ReactNode;
} & React.HTMLProps<HTMLButtonElement>;

export function IconButton(props: Props) {
  return (
    <button
      {...props}
      type={props.type as 'button' | 'submit' | 'reset'}
      className={clsx(
        'hover:shadow hover:bg-neutral-500 hover:cursor-pointer border rounded transition-colors border-neutral-400 text-white',
        props.className
      )}>
      {props.children}
    </button>
  );
}
