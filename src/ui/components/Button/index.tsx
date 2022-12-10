import React from 'react';
import clsx from 'clsx'

export function Button(props: React.HTMLProps<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx('bg-neutral-900 text-white shadow-sm py-2 px-4 text-xs border border-neutral-500 hover:border-neutral-300 transition-colors disabled:bg-neutral-700 disabled:cursor-default disabled:transition-none disabled:border-neutral-500 disabled:text-neutral-400', props.className)}
      type={props.type as 'button' | 'submit' | 'reset'}>
      {props.children}
    </button>
  );
}
