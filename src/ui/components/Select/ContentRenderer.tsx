import clsx from 'clsx';
import React from 'react';
import { SelectRenderer } from 'react-dropdown-select';
import { twMerge } from 'tailwind-merge';
import { SelectOption } from '.';

export function ContentRenderer(props: SelectRenderer<SelectOption>) {
  return (
    <p
      className={twMerge(
        clsx('text-white text-xs', { 'text-neutral-400': props.props.disabled })
      )}>
      {props.state.values[0].label}
    </p>
  );
}
