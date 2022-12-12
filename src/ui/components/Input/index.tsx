import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

type Props = React.HTMLProps<HTMLInputElement> & {
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
};

export function Input(props: Props) {
  function onChange(event: React.FormEvent<HTMLInputElement>) {
    const target = event.target as HTMLInputElement;
    if (props.onChange) {
      props.onChange(target.value);
    }
  }

  function onBlur(event: React.FocusEvent<HTMLInputElement>) {
    const target = event.target as HTMLInputElement;
    if (props.onBlur) {
      props.onBlur(target.value);
    }
  }

  return (
    <div className='flex flex-col items-start w-full flex-grow'>
      <label className='text-white text-xs mb-1'>{props.label}</label>
      <input
        {...props}
        className={twMerge(
          clsx(
            'w-full bg-neutral-600 p-1 text-white text-xs focus:outline-none focus:outline-blue-400 disabled:text-neutral-400',
            props.className
          )
        )}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  );
}
