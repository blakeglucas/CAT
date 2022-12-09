import React from 'react'
import { UilAngleDown, UilAngleUp } from '@iconscout/react-unicons'
import { SelectRenderer } from 'react-dropdown-select'
import { SelectOption } from '.'
import clsx from 'clsx'

export function HandleRenderer(props: SelectRenderer<SelectOption>) {
    return (
        <UilAngleDown size={4} className={clsx('text-white transition-all', {'rotate-180': props.state.dropdown})} />
    )
}