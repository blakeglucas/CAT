import React from 'react';
import { useDispatch, useSelector } from '../../store/hooks';
import {
  startGetCoordinates as startGetCoordinatesThunk,
  stopGetCoordinates as stopGetCoordinatesThunk,
} from '../../store/thunks/MachineControl.thunk/MachineInfo.thunk';
import { RootState } from '../../store';
import clsx from 'clsx';

export function MachineCoordinates() {
  const dispatch = useDispatch();

  const cncReady = useSelector(
    (state: RootState) => state.serial.cncPort && state.serial.cncConnected
  );
  const coordinates = useSelector(
    (state: RootState) => state.machineControl.machineInfo.coordinates
  );

  React.useEffect(() => {
    if (cncReady) {
      dispatch(startGetCoordinatesThunk());
    } else {
      dispatch(stopGetCoordinatesThunk());
    }
    return () => {
      dispatch(stopGetCoordinatesThunk());
    };
  }, [cncReady]);

  return (
    <p
      className={clsx('text-white text-lg', {
        'text-neutral-500': !cncReady,
      })}>
      ({coordinates[0].toFixed(2)}, {coordinates[1].toFixed(2)},{' '}
      {coordinates[2].toFixed(2)})
    </p>
  );
}
