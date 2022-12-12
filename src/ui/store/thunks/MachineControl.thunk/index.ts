import { createAsyncThunk } from '@reduxjs/toolkit';
import { serialActions } from '../../../store/reducers/Serial.reducer';
import { SERIAL_COMMAND, SERIAL_PARAMS } from '../../../../shared/marlin';
import { machineControlActions } from '../../../store/reducers/MachineControl.reducer';

const { ipcRenderer } = window.require('electron');

type CommandPayload = {
  cmd: SERIAL_COMMAND;
  params?: SERIAL_PARAMS;
};

export const sendMachineCommand = createAsyncThunk(
  'serial/sendCommand',
  async ({ cmd, params }: CommandPayload, { dispatch }) => {
    dispatch(serialActions.setRunningCommand(true));
    return await new Promise<string | undefined>((resolve, reject) => {
      if (cmd === SERIAL_COMMAND.HOME) {
        dispatch(machineControlActions.setHoming(true));
      }
      ipcRenderer.once(
        'serial/sendCommand',
        (event, err?: string, result?: string) => {
          if (cmd === SERIAL_COMMAND.HOME) {
            dispatch(machineControlActions.setHoming(false));
          }
          if (err) {
            console.error(err);
            reject(err);
          } else {
            dispatch(serialActions.setRunningCommand(false));
            resolve(result);
          }
        }
      );
      ipcRenderer.send('serial/sendCommand', cmd, params);
    });
  }
);
