import React from 'react';
import { Rnd, RndResizeCallback } from 'react-rnd';
import { Select } from '../Select';
import SiderHandle from './Handle';
import { Input } from '../Input';
import { Button } from '../Button';

interface Props {
  width: number;
  setWidth: (width: number) => void;
}

export function Sider(props: Props) {
  const onResize: RndResizeCallback = (e, dir, elementRef, delta, position) => {
    e.stopPropagation();
    e.preventDefault();
    props.setWidth(elementRef.offsetWidth);
  };

  return (
    <Rnd
      position={{ x: 0, y: 0 }}
      size={{ width: props.width, height: '100%' }}
      disableDragging
      className='overflow-hidden'
      minWidth={200}
      maxWidth='50%'
      onResize={onResize}
      resizeHandleComponent={{ right: <SiderHandle /> }}
      resizeHandleStyles={{ right: { width: '16px' } }}>
      <div className='w-full h-full flex flex-col bg-neutral-800 pl-4 py-2 pr-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Select label='CNC Port'>
            <option>COM4</option>
            <option>COM10</option>
          </Select>
          <Input label='CNC Baud'></Input>
          <Select label='Switch Port'>
            <option>COM4</option>
            <option>COM10</option>
          </Select>
          <Input label='Switch Baud'></Input>
          <div className='col-span-1 md:col-span-2 w-full flex justify-center'>
            <Button>Refresh Serial Ports</Button>
          </div>
        </div>
      </div>
    </Rnd>
  );
}
