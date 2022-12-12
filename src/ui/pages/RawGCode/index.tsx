import React from 'react';
import { useDispatch, useSelector } from '../../store/hooks';
import { Button } from '../../components/Button';
import {
  GCodeRenderer,
  GCodeRendererHandler,
} from '../../components/GCodeRenderer';
import { RootState } from '../../store';
import { gcodeActions } from '../../store/reducers/GCode.reducer';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/Input';
import { contourGCode as contourGCodeThunk } from '../../store/thunks/GCode.thunk';

const { ipcRenderer } = window.require('electron');

export function RawGCodePage() {
  const rawGCode = useSelector((state: RootState) => state.gcode.raw);
  const zDepth = useSelector((state: RootState) => state.gcode.zDepth);
  const { running, done } = useSelector((state: RootState) => ({
    running: state.gcode.contourRunning,
    done: state.gcode.contourDone,
  }));
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const didStartContourRef = React.useRef(false);
  const gcodeRef = React.useRef<GCodeRendererHandler>();

  function clearGCode() {
    dispatch(gcodeActions.setRawGCode(undefined));
  }

  function importGCode() {
    ipcRenderer.send('menu/requestOpenRawGCode');
  }

  function setZDepth(value: string) {
    const v = Number(value);
    if (!isNaN(v) && v) {
      dispatch(gcodeActions.setZDepth(v));
    }
  }

  function contourGCode() {
    didStartContourRef.current = true;
    dispatch(contourGCodeThunk());
  }

  React.useEffect(() => {
    if (done && !running && didStartContourRef.current) {
      navigate('/contouredGCode');
      didStartContourRef.current = false;
    }
  }, [done, running, didStartContourRef.current]);

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
              Calculate Contoured G-Code
            </Button>
          </>
        ) : (
          <Button
            onClick={importGCode}
            disabled={running}>
            Import G-Code File for Contouring
          </Button>
        )}
        {rawGCode && (
          <Button
            onClick={clearGCode}
            disabled={running}>
            Clear Loaded G-Code
          </Button>
        )}
      </div>
    </div>
  );
}
