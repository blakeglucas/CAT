import React from 'react';

export function Input(props: React.HTMLProps<HTMLInputElement>) {
  return (
    <div className='flex flex-col items-start w-full flex-grow'>
      <label className='text-white text-xs mb-1'>{props.label}</label>
      <input
        className='w-full bg-neutral-600 p-1 text-white text-xs focus:outline-none focus:outline-blue-400 disabled:text-neutral-400'
        {...props}
      />
    </div>
  );
}
