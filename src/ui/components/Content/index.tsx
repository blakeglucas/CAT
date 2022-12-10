import React from 'react';

interface Props {
  marginLeft: number;
  children?: React.ReactNode;
}

export function Content(props: Props) {
  return (
    <div
      style={{ left: props.marginLeft }}
      className='absolute top-0 right-0 bottom-0 bg-neutral-700 overflow-auto'>
      {props.children}
    </div>
  );
}
