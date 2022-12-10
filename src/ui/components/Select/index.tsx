import React from 'react';
import RDSelect, { SelectProps as RDSelectProps } from 'react-dropdown-select';
import { ContentRenderer } from './ContentRenderer';
import { HandleRenderer } from './HandleRenderer';
import { ItemRenderer } from './ItemRenderer';
import { NoDataRenderer } from './NoDataRenderer';
import styled from 'styled-components'
import tw from 'tailwind-styled-components'

const SelectComponent = tw(RDSelect)`
  bg-neutral-600
  disabled:text-neutral-400
  outline-none
  focus:outline-blue-400
  focus-within:outline-blue-400
`;

export interface SelectOption {
  label: string;
  value?: any;
}

type Props = RDSelectProps<SelectOption> & {
  label: string;
};

export function Select(props: Props) {
  return (
    <div className='flex flex-col'>
      <label className='text-white text-xs mb-1'>{props.label}</label>
      <SelectComponent
        dropdownGap={0}
        style={{minHeight: '24px', border: 'none'}}
        {...props}
        dropdownHandleRenderer={HandleRenderer}
        noDataRenderer={NoDataRenderer}
        itemRenderer={ItemRenderer}
        contentRenderer={ContentRenderer}
      />
    </div>
  );
}
