import React from 'react';
import clsx from 'clsx';
import { NavLink } from 'react-router-dom';

type NonFillerProps = {
  label: string;
  href?: string;
  filler?: false;
};

type FillerProps = {
  filler?: true;
  label?: never;
  href?: never;
};

export default function TabComponent(props: NonFillerProps | FillerProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        clsx(
          'text-white py-2 px-8 text-center text-sm border-white transition-colors select-none first:border-l-0',
          {
            'border-b bg-neutral-800': !isActive || props.filler,
            'border border-b-0 bg-neutral-900': isActive && !props.filler,
            'flex-grow': props.filler,
            'hover:bg-neutral-700 hover:cursor-pointer':
              !isActive && !props.filler,
          }
        )
      }
      style={{ minWidth: '75px' }}
      tabIndex={props.filler ? -1 : undefined}
      to={props.href}>
      {props.label}
    </NavLink>
  );
}
