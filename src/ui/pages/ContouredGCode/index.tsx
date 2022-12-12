import React from 'react';
import { useDispatch, useSelector } from '../../store/hooks';
import { Button } from '../../components/Button';
import {
  GCodeRenderer,
  GCodeRendererHandler,
} from '../../components/GCodeRenderer';
import { RootState } from '../../store';
import { gcodeActions } from '../../store/reducers/GCode.reducer';
import { Input } from '../../components/Input';
import { contourGCode as contourGCodeThunk } from '../../store/thunks/GCode.thunk';

export function ContouredGCodePage() {
  const cgcode = useSelector((state: RootState) => state.gcode.contoured);
  const zDepth = useSelector((state: RootState) => state.gcode.zDepth);
  const { running } = useSelector((state: RootState) => ({
    running: state.gcode.contourRunning,
    done: state.gcode.contourDone,
  }));
  const dispatch = useDispatch();

  const gcodeRef = React.useRef<GCodeRendererHandler>();

  function setZDepth(value: string) {
    const v = Number(value);
    if (!isNaN(v) && v) {
      dispatch(gcodeActions.setZDepth(v));
    }
  }

  function contourGCode() {
    dispatch(contourGCodeThunk());
  }

  return (
    <div className='flex-1 flex-grow flex-shrink-0 h-full w-full relative'>
      <GCodeRenderer
        gcode={cgcode}
        ref={gcodeRef}
      />
      <div className='absolute flex flex-col items-start gap-y-2 top-8 left-16'>
        <Button onClick={() => gcodeRef.current?.resetView()}>
          Reset View
        </Button>
        {!!cgcode && (
          <>
            <Input
              label='Target Z Depth'
              defaultValue={zDepth}
              onBlur={(value) => setZDepth(value as string)}
              className='bg-neutral-900 text-white mb-1 p-2'
              disabled={running}
            />
            <Button
              onClick={contourGCode}
              disabled={running}>
              Refresh
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
