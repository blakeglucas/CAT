import React from 'react';
import {
  SelectProps,
  SelectRenderer,
  SelectState,
} from 'react-dropdown-select';
import { SelectOption } from '.';

const handlePlaceHolder = (
  props: SelectProps<SelectOption>,
  state: SelectState<SelectOption>
) => {
  const { addPlaceholder, searchable, placeholder } = props;
  const noValues = state.values && state.values.length === 0;
  const hasValues = state.values && state.values.length > 0;

  if (hasValues && addPlaceholder && searchable) {
    return addPlaceholder;
  }

  if (noValues) {
    return placeholder;
  }

  if (hasValues && !searchable) {
    return '';
  }

  return '';
};

export function InputRenderer({
  props,
  state,
  methods,
}: SelectRenderer<SelectOption>) {
  return (
    <input
      ref={this.input}
      tabIndex={-1}
      onFocus={(event) => event.stopPropagation()}
      className='bg-red-500'
      size={methods.getInputSize()}
      value={state.search}
      readOnly={!props.searchable}
      onClick={() => methods.dropDown('open')}
      onKeyPress={this.handleKeyPress}
      onChange={methods.setSearch}
      onBlur={this.onBlur}
      placeholder={handlePlaceHolder(props, state)}
      disabled={props.disabled}
    />
  );
}
