import React from 'react';
import RCSlider, { SliderProps as RCSliderProps } from 'rc-slider';
import { twMerge } from 'tailwind-merge';

import 'rc-slider/assets/index.css';
import './overrides.sass';

export type SliderProps = RCSliderProps & {
  label: string;
  className?: string;
  style?: React.CSSProperties;
};

export function Slider(props: SliderProps) {
  return (
    <div className={twMerge('flex flex-col w-full', props.className)}>
      <label className='text-white text-xs mb-1'>{props.label}</label>
      <RCSlider {...props} />
    </div>
  );
}
