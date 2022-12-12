import { createAsyncThunk } from '@reduxjs/toolkit';
import { SERIAL_COMMAND } from '../../../../shared/marlin';
import { RootState } from '../..';
import { sendMachineCommand } from '../MachineControl.thunk';
import { machineInfoActions } from '../../reducers/MachineControl.reducer/MachineInfo.reducer';
import { parsePosition } from '../../../utils/parsePosition';

export const startGetCoordinates = createAsyncThunk(
  'machineControl/machineInfo/startGetCoordinates',
  async (_, { dispatch }) => {
    async function getCoordinates() {
      const rawPosition = await dispatch(
        sendMachineCommand({ cmd: SERIAL_COMMAND.GET_POSITION })
      );
      const position = parsePosition(rawPosition.payload as string) as [
        number,
        number,
        number
      ];
      if (!position.includes(null) && !position.includes(undefined) && !position.includes(NaN)) {
        dispatch(machineInfoActions.setCoordinates(position));
      }
    }
    const pollPtr = setInterval(getCoordinates, 1000);
    dispatch(machineInfoActions.setCoordinatesIntervalRef(pollPtr));
  }
);

export const stopGetCoordinates = createAsyncThunk(
  'machineControl/machineInfo/stopGetCoordinates',
  async (_, { dispatch, getState }) => {
    const pollPtr = (getState() as RootState).machineControl.machineInfo
      .coordinatesIntervalRef;
    if (pollPtr) {
      clearInterval(pollPtr);
    }
    dispatch(machineInfoActions.setCoordinatesIntervalRef(undefined));
  }
);
