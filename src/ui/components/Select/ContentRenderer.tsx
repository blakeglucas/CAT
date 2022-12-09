import React from "react";
import { SelectRenderer } from "react-dropdown-select";
import { SelectOption } from ".";

export function ContentRenderer(props: SelectRenderer<SelectOption>) {
    return (
        <p className='text-white text-sm'>{props.state.values[0].label}</p>
    )
}