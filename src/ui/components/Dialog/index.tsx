import React from 'react';
import {
  Dialog as RawDialog,
  DialogContent,
  DialogOverlay,
  DialogProps as RawDialogProps,
} from '@reach/dialog';
import { animated, useTransition } from 'react-spring';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { UilTimes, UilX } from '@iconscout/react-unicons';

const AnimatedDialogOverlay = animated(DialogOverlay);
const AnimatedDialogContent = animated(DialogContent);

export type DialogAction = {
    renderer?: (index: number, onActivate: (() => void) | (() => Promise<void>)) => JSX.Element
    btnLabel?: string
    onActivate: (() => void) | (() => Promise<void>)
}

export type DialogProps = RawDialogProps & {
    title: string
    message?: string
    actions: DialogAction[]
};

export function Dialog(props: DialogProps) {
  const transitions = useTransition(props.isOpen, {
    from: { opacity: 0, y: -10 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: -10 },
  });
  return transitions(
    (styles, item) =>
      item && (
        // <AnimatedDialogOverlay style={{ opacity: styles.opacity }} className='bg-neutral-500 bg-opacity-30'>
          <AnimatedDialogContent
            className='bg-neutral-800 text-white max-w-xl shadow-lg relative'
            style={{
              transform: styles.y.to(
                (value) => `translate3d(0px, ${value}px, 0px)`
              ),
              minWidth: '25vw',
            }}>
            <h1 className='text-xl bg-neutral-900 p-4'>{props.title}</h1>
            <div className='px-4 py-8 text-sm'>
                {props.children || props.message}
            </div>
            <div className='p-4 bg-neutral-900 flex flex-row items-center justify-end gap-4 w-full'>
                {props.actions.map((action, i) => {
                    if (action.renderer) {
                        return action.renderer(i, action.onActivate)
                    }
                    return <Button onClick={action.onActivate} className='bg-neutral-700'>{action.btnLabel}</Button>
                })}
            </div>
            <IconButton onClick={props.onDismiss} className='absolute top-4 right-4'>
                <UilTimes size={16} />
            </IconButton>
          </AnimatedDialogContent>
        // </AnimatedDialogOverlay>
      )
  );
}
