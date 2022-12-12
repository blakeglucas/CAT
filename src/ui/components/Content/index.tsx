import React from 'react';

interface Props {
  marginLeft: number;
  children?: React.ReactNode;
}

const headerHeight = 37;

export function Content(props: Props) {
  return (
    <div
      style={{
        left: props.marginLeft,
        marginTop: -headerHeight,
        paddingTop: headerHeight,
      }}
      className='absolute top-0 right-0 bottom-0 bg-neutral-600 overflow-hidden'>
      {props.children}
    </div>
  );
}
