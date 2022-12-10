import React from 'react';
import { useDispatch, useSelector } from '../../store/hooks';
import { Button } from '../../components/Button';
import { runAutoHome as runAutoHomeThunk } from '../../store/thunks/autoHome.thunk';
import { Dialog, DialogProps } from '../../components/Dialog';
import { serialReadySelector } from '../../store/reducers/serial.reducer';
import { getCurrentMachinePosition } from '../../store/thunks/serial.thunk';
import { parsePosition } from '../../utils/parsePosition';
import { Input } from '../../components/Input';
import { autoHomeActions } from '../../store/reducers/auto-home.reducer';

function ConfirmDialog(props: DialogProps & { runAutoHome: () => void}) {
  return (
    <Dialog
      title='Proceed with Auto-Home?'
      message='Set your Work Origin at the appropriate X,Y-coordinates and a positive Z-coordinate, Auto-Home will do the rest.'
      actions={[
        {
          btnLabel: 'Cancel Auto-Home',
          onActivate: props.onDismiss,
        },
        {
          btnLabel: 'Continue',
          onActivate: () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            props.onDismiss(null!);
            props.runAutoHome();
          },
        },
      ]}
      {...props}
    />
  );
}

export function AutoHomePage() {
  const autoHomeRunning = useSelector((state) => state.autoHome.running);
  const [zStep, zTrav] = useSelector((state) => [
    state.autoHome.zStep,
    state.autoHome.zTrav,
  ]);
  const dispatch = useDispatch();
  const serialReady = useSelector(serialReadySelector);

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [currentPosition, setCurrentPosition] = React.useState([]);

  async function updateMachinePosition() {
    if (serialReady) {
      const position = await dispatch(getCurrentMachinePosition());
      setCurrentPosition(
        parsePosition((position.payload as any).payload as string)
      );
    }
  }

  React.useEffect(() => {
    const mpTimeout = setInterval(updateMachinePosition, 1000);
    return () => {
      clearInterval(mpTimeout);
    };
  }, [serialReady]);

  React.useEffect(() => console.log(serialReady), [serialReady]);

  const runPtr = React.useRef(undefined);

  function promptForConfirmation() {
    setShowConfirmDialog(true);
  }

  function runAutoHome() {
    runPtr.current = dispatch(runAutoHomeThunk());
    console.log(runPtr.current);
  }

  async function cancelRun() {
    if (autoHomeRunning && runPtr.current) {
      console.log('attempting to abort');
      await runPtr.current.abort();
    }
  }

  return (
    <>
      <div>
        <div className='flex flex-row items-center justify-center h-24 bg-neutral-900'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 items-end'>
            <Input
              label='Z Stepdown (mm)'
              defaultValue={zStep}
              onBlur={(value) =>
                dispatch(autoHomeActions.setZStep(Number(value)))
              }
            />
            <Input
              label='Z Travel Height (mm)'
              defaultValue={zTrav}
              onBlur={(value) =>
                dispatch(autoHomeActions.setZTrav(Number(value)))
              }
            />
            <Button
              className='bg-neutral-700'
              onClick={promptForConfirmation}
              disabled={autoHomeRunning || !serialReady}>
              Start Auto-Home
            </Button>
            <Button
              className='bg-neutral-700'
              onClick={cancelRun}
              disabled={!autoHomeRunning || !serialReady}>
              Stop Auto-Home
            </Button>
          </div>
        </div>
        <div className='w-full flex flex-col items-center justify-center h-96 text-7xl'>
          X: {currentPosition[0]} | Y: {currentPosition[1]} | Z:{' '}
          {currentPosition[2]}
        </div>
      </div>
      <ConfirmDialog isOpen={showConfirmDialog} onDismiss={() => setShowConfirmDialog(false)} runAutoHome={runAutoHome} />
    </>
  );
}
