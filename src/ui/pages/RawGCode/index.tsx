import React from 'react';
import { useDispatch, useSelector } from '../../store/hooks';
import { Button } from '../../components/Button';
import {
  GCodeRenderer,
  GCodeRendererHandler,
} from '../../components/GCodeRenderer';
import { RootState } from '../../store';
import { gcodeActions } from '../../store/reducers/GCode.reducer';

const { ipcRenderer } = window.require('electron');

export function RawGCodePage() {
  const rawGCode = useSelector((state: RootState) => state.gcode.raw);
  const dispatch = useDispatch();

  const gcodeRef = React.useRef<GCodeRendererHandler>();

  function clearGCode() {
    dispatch(gcodeActions.setRawGCode(undefined));
  }

  function importGCode() {
    ipcRenderer.send('menu/requestOpenRawGCode');
  }

  return (
    <div className='flex-1 flex-grow flex-shrink-0 h-full w-full relative'>
      <GCodeRenderer
        gcode={rawGCode}
        ref={gcodeRef}
      />
      <div className='absolute flex flex-col items-start gap-y-2 top-8 left-16'>
        <Button onClick={() => gcodeRef.current?.resetView()}>
          Reset View
        </Button>
        {rawGCode ? (
          <Button>Calculate Contoured G-Code</Button>
        ) : (
          <Button onClick={importGCode}>
            Import G-Code File for Contouring
          </Button>
        )}
        {rawGCode && <Button onClick={clearGCode}>Clear Loaded G-Code</Button>}
      </div>
    </div>
  );
}
