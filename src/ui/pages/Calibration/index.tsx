import React from 'react';
import { RootState } from '../../store';
import { useDispatch, useSelector } from '../../store/hooks';
import { Input } from '../../components/Input';
import {
  calibrationActions,
  CALIBRATION_STATE,
} from '../../store/reducers/calibration.reducer';
import { Button } from '../../components/Button';
import { Dialog, DialogProps } from '../../components/Dialog';
import { runCalibration as runCalibrationThunk } from '../../store/thunks/calibration.thunk';

function ConfirmDialog(
  props: Partial<DialogProps> & { runCalibration: () => void }
) {
  return (
    <Dialog
      {...props}
      title='Overwrite Calibration Results?'
      message='Would you like to overwrite the existing calibration?'
      actions={[
        {
          btnLabel: 'No',
          onActivate: () => props.onDismiss(null!),
        },
        {
          btnLabel: 'Yes',
          onActivate: () => props.runCalibration(),
        },
      ]}
    />
  );
}

export function CalibrationPage() {
  const [xDim, yDim, xPoints, yPoints, zStep, zTrav, calState] = useSelector(
    (state: RootState) => [
      state.calibration.xDim,
      state.calibration.yDim,
      state.calibration.xPoints,
      state.calibration.yPoints,
      state.calibration.zStep,
      state.calibration.zTrav,
      state.calibration.state,
    ]
  );
  const dispatch = useDispatch();

  const runPtr = React.useRef(undefined);

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  function promptForConfirmation() {
    setShowConfirmDialog(true);
  }

  function closeConfirmation() {
    setShowConfirmDialog(false);
  }

  function runCalibration() {
    runPtr.current = dispatch(runCalibrationThunk());
  }

  function stopCalibration() {
    runPtr.current.abort();
  }

  return (
    <>
      <div>
        <div className='flex flex-row items-center justify-center h-24 bg-neutral-900'>
          <div className='grid grid-cols-3 lg:grid-cols-7 gap-8'>
            <Input
              label='X Size (mm)'
              defaultValue={xDim}
              onBlur={(value) =>
                dispatch(calibrationActions.setXDim(Number(value)))
              }
            />
            <Input
              label='Y Size (mm)'
              defaultValue={yDim}
              onBlur={(value) =>
                dispatch(calibrationActions.setYDim(Number(value)))
              }
            />
            <Input
              label='X Points'
              defaultValue={xPoints}
              onBlur={(value) =>
                dispatch(calibrationActions.setXPoints(Number(value)))
              }
            />
            <Input
              label='Y Points'
              defaultValue={yPoints}
              onBlur={(value) =>
                dispatch(calibrationActions.setYPoints(Number(value)))
              }
            />
            <Input
              label='Z Step (mm)'
              defaultValue={zStep}
              onBlur={(value) =>
                dispatch(calibrationActions.setZStep(Number(value)))
              }
            />
            <Input
              label='Z Travel Height (mm)'
              defaultValue={zTrav}
              onBlur={(value) =>
                dispatch(calibrationActions.setZTrav(Number(value)))
              }
            />
            {calState === CALIBRATION_STATE.IDLE && (
              <Button
                className='my-auto bg-neutral-700'
                onClick={promptForConfirmation}>
                Start Calibration
              </Button>
            )}
            {calState === CALIBRATION_STATE.RUNNING && (
              <Button
                className='my-auto bg-neutral-700'
                onClick={stopCalibration}>
                Stop Calibration
              </Button>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onDismiss={closeConfirmation}
        runCalibration={() => {
          closeConfirmation()
          runCalibration()
        }}
      />
    </>
  );
}
