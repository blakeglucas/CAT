import React from 'react';
import { useDispatch, useSelector } from '../../store/hooks';
import { Button } from '../../components/Button';
import { runAutoWorkOrigin as runAutoWorkOriginThunk } from '../../store/thunks/MachineControl.thunk/AutoWorkOrigin.thunk';
import { serialReadySelector } from '../../store/reducers/Serial.reducer';
import { Input } from '../../components/Input';
import { autoWorkOriginActions } from '../../store/reducers/MachineControl.reducer/AutoWorkOrigin.reducer';

export function AutoWorkOrigin() {
  const [running, zStep] = useSelector((state) => [
    state.machineControl.autoWorkOrigin.running,
    state.machineControl.autoWorkOrigin.zStep,
  ]);
  const dispatch = useDispatch();
  const serialReady = useSelector(serialReadySelector);

  const runPtr = React.useRef(undefined);

  function runAutoHome() {
    runPtr.current = dispatch(runAutoWorkOriginThunk());
    console.log(runPtr.current);
  }

  async function cancelRun() {
    if (running && runPtr.current) {
      console.log('attempting to abort');
      await runPtr.current.abort();
    }
  }

  return (
    <>
      <div>
        <div className='flex flex-row items-center justify-center'>
          <div className='grid grid-cols-2 gap-4 items-end'>
            <Input
              label='Z Stepdown (mm)'
              defaultValue={zStep}
              onBlur={(value) =>
                dispatch(autoWorkOriginActions.setZStep(Number(value)))
              }
            />
            {!running && serialReady && (
              <Button onClick={runAutoHome}>Start</Button>
            )}
            {running && serialReady && (
              <Button onClick={cancelRun}>Stop</Button>
            )}
          </div>
        </div>
      </div>
      {/* <ConfirmDialog
        isOpen={showConfirmDialog}
        onDismiss={() => setShowConfirmDialog(false)}
        runAutoHome={runAutoHome}
      /> */}
    </>
  );
}
