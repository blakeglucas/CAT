import React from 'react'
import { UilDraggabledots } from '@iconscout/react-unicons'

export default function SiderHandle() {
    return (
        <div className='h-full bg-neutral-900 flex flex-col items-center justify-center' style={{width: 'calc(100% - 5px)'}}>
            <UilDraggabledots color='#FFFFFF' size={12} />
        </div>
    )
}