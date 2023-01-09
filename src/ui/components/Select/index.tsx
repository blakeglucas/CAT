import React from 'react';
import RDSelect, { SelectProps as RDSelectProps } from 'react-dropdown-select';
import { ContentRenderer } from './ContentRenderer';
import { HandleRenderer } from './HandleRenderer';
import { ItemRenderer } from './ItemRenderer';
import { NoDataRenderer } from './NoDataRenderer';

export interface SelectOption {
  label: string;
  value?: unknown;
}

type Props = RDSelectProps<SelectOption> & {
  label: string;
};

export function Select(props: Props) {
  return (
    <div className='flex flex-col'>
      <label className='text-white text-xs mb-1'>{props.label}</label>
      <RDSelect
        dropdownGap={0}
        style={{ minHeight: '24px', border: 'none', opacity: 1 }}
        {...props}
        dropdownHandleRenderer={HandleRenderer}
        noDataRenderer={NoDataRenderer}
        itemRenderer={ItemRenderer}
        contentRenderer={ContentRenderer}
      />
    </div>
  );
}
