import React from 'react'
import { SelectItemRenderer } from 'react-dropdown-select'
import { SelectOption } from '.'

export function ItemRenderer({ item, itemIndex, props, state, methods }: SelectItemRenderer<SelectOption>) {
    return (
        <div className='bg-neutral-600 text-white text-xs p-3 hover:bg-neutral-800 transition-colors' onClick={() => methods.addItem(item)}>
            {item.label}
        </div>
    )
}