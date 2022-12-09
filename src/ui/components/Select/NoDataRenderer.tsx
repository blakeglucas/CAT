import React from 'react'
import { SelectRenderer } from 'react-dropdown-select'
import { SelectOption } from '.'

export function NoDataRenderer(props: SelectRenderer<SelectOption>) {
    return (
        <div className='flex flex-row items-center justify-center w-full h-8 bg-neutral-700 text-white text-sm'>
            <span>{props.props.noDataLabel || 'No Data'}</span>
        </div>
    )
}