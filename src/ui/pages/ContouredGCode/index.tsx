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
import { useAllSnackbars } from '../../hooks/useSnackbar';

export function ContouredGCodePage() {
  const cgcode = useSelector((state: RootState) => state.gcode.contoured);
  const errors = useSelector((state: RootState) => state.gcode.errors);
  const zDepth = useSelector((state: RootState) => state.gcode.zDepth);
  const { running, done } = useSelector((state: RootState) => ({
    running: state.gcode.contourRunning,
    done: state.gcode.contourDone,
  }));
  const dispatch = useDispatch();

  const [
    showInfo,
    closeInfo,
    showSuccess,
    closeSuccess,
    showWarning,
    closeWarning,
    showError,
    closeError,
  ] = useAllSnackbars();

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

  React.useEffect(() => {
    if (done && !running) {
      if (cgcode === undefined) {
        showError(
          'There was an error running contouring process. This usually happens when the input g-code extends beyonds the bounds of the calibration range.'
        );
      } else {
        /*
      else if (errors) {
        showWarning('There may have been some errors in the last run. This usually does not affect the contour result, but please double check the output.')
      }
      */
        showSuccess('Contour operation completed successfully!');
      }
    }
  }, [done, running, cgcode]);

  return (
    <div className='flex-1 flex-grow flex-shrink-0 h-full w-full relative'>
      <GCodeRenderer
        gcode={cgcode}
        ref={gcodeRef}
        zScale={10}
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
