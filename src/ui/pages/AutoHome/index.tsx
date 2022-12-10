import React from 'react';
import { useDispatch, useSelector } from '../../store/hooks';
import { Button } from '../../components/Button';
import { runAutoHome as runAutoHomeThunk } from '../../store/thunks/autoHome.thunk';

export function AutoHomePage() {
  const autoHomeRunning = useSelector((state) => state.autoHome.running);
  const dispatch = useDispatch();

  const runPtr = React.useRef(undefined);

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
    <div>
      <Button
        onClick={runAutoHome}
        disabled={autoHomeRunning}>
        Run
      </Button>
      <Button
        onClick={cancelRun}
        disabled={!autoHomeRunning}>
        Stop
      </Button>
    </div>
  );
}
