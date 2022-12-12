/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { RootState } from '../../store';
import { useDispatch, useSelector } from '../../store/hooks';
import { Input } from '../../components/Input';
import {
  calibrationActions,
  CALIBRATION_STATE,
} from '../../store/reducers/Calibration.reducer';
import { Button } from '../../components/Button';
import { Dialog, DialogProps } from '../../components/Dialog';
import {
  CalibrationThunkArgs,
  safelyStartCalibration,
  safelyStopCalibration,
} from '../../store/thunks/Calibration.thunk';
import CalibrationGrid, {
  CalibrationGridHandler,
} from '../../components/CalibrationGrid';
import { useHeaderHeight } from '../../hooks/useHeaderHeight';
import { serialReadySelector } from '../../store/reducers/Serial.reducer';

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
          onActivate: () => props.onDismiss(null),
        },
        {
          btnLabel: 'Yes',
          onActivate: () => props.runCalibration(),
        },
      ]}
    />
  );
}

function ResumeDialog(
  props: Partial<DialogProps> & { runCalibration: () => void }
) {
  return (
    <Dialog
      {...props}
      title='Resume Incomplete Calibration?'
      message='An incomplete calibration has been detected. Would you like to resume?'
      actions={[
        {
          btnLabel: 'No',
          onActivate: () => props.onDismiss(null),
        },
        {
          btnLabel: 'Yes',
          onActivate: () => props.runCalibration(),
        },
      ]}
    />
  );
}

function CalibrationFinishedDialog(props: Partial<DialogProps>) {
  return (
    <Dialog
      {...props}
      title='Calibration Finished!'
      message='Height map data has been collected successfully'
      actions={[
        {
          btnLabel: 'OK',
          onActivate: () => props.onDismiss(null),
        },
      ]}
    />
  );
}

export function CalibrationPage() {
  const [
    xDim,
    yDim,
    xPoints,
    yPoints,
    zStep,
    zTrav,
    calState,
    incompleteRun,
    complete,
  ] = useSelector((state: RootState) => [
    state.calibration.xDim,
    state.calibration.yDim,
    state.calibration.xPoints,
    state.calibration.yPoints,
    state.calibration.zStep,
    state.calibration.zTrav,
    state.calibration.state,
    !state.calibration.completed &&
      (state.calibration.heightMap.length > 0 ||
        state.calibration.rowMap.length > 0) &&
      state.calibration.state === CALIBRATION_STATE.IDLE,
    state.calibration.completed,
  ]);
  const serialReady = useSelector(serialReadySelector);
  const dispatch = useDispatch();

  const ranCalRef = React.useRef(false);

  const headerHeight = useHeaderHeight();

  const runPtr = React.useRef(undefined);
  const controlPanelRef = React.useRef<HTMLDivElement>();

  const calibrationGridRef = React.useRef<CalibrationGridHandler>(null);

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showResumeDialog, setShowResumeDialog] = React.useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = React.useState(false);

  function promptForConfirmation() {
    if (incompleteRun) {
      setShowResumeDialog(true);
    } else if (incompleteRun || complete) {
      setShowConfirmDialog(true);
    }
  }

  function closeConfirmation() {
    setShowConfirmDialog(false);
  }

  function runCalibration(args?: CalibrationThunkArgs) {
    runPtr.current = dispatch(safelyStartCalibration(args || null));
  }

  function stopCalibration() {
    dispatch(safelyStopCalibration());
  }

  React.useEffect(() => {
    if (complete && ranCalRef.current) {
      setTimeout(() => {
        setShowCompleteDialog(true);
      }, 1000);
    }
  }, [complete, ranCalRef.current]);

  React.useEffect(() => {
    if (calState !== CALIBRATION_STATE.IDLE) {
      ranCalRef.current = true;
    }
  }, [calState]);

  return (
    <>
      <div
        className='flex flex-col items-start justify-start w-full h-full relative'
        style={{ marginTop: -headerHeight, paddingTop: headerHeight }}>
        <div
          ref={controlPanelRef}
          className='flex flex-row items-center justify-center h-24 bg-neutral-900 w-full'>
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
                disabled={!serialReady}
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
        <div className='flex-1 flex-grow flex-shrink-0 h-full w-full relative'>
          {/* @ts-ignore */}
          <CalibrationGrid ref={calibrationGridRef} />
          <Button
            className='absolute top-8 right-8'
            onClick={() => calibrationGridRef.current?.resetView()}>
            Reset View
          </Button>
        </div>
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onDismiss={closeConfirmation}
          runCalibration={() => {
            closeConfirmation();
            runCalibration();
          }}
        />
        <ResumeDialog
          isOpen={showResumeDialog}
          onDismiss={() => {
            setShowResumeDialog(false);
            setShowConfirmDialog(true);
          }}
          runCalibration={() => {
            setShowResumeDialog(false);
            runCalibration({ resume: true });
          }}
        />
        <CalibrationFinishedDialog
          isOpen={showCompleteDialog}
          onDismiss={() => setShowCompleteDialog(false)}
        />
      </div>
    </>
  );
}
