import { createAsyncThunk } from '@reduxjs/toolkit';
import { SERIAL_COMMAND } from '../../../../shared/marlin';
import { RootState } from '../..';
import { sendMachineCommand } from '../MachineControl.thunk';
import { sleep } from '../../../utils/sleep';
import { autoWorkOriginActions } from '../../reducers/MachineControl.reducer/AutoWorkOrigin.reducer';

const { ipcRenderer } = window.require('electron');

export const runAutoWorkOrigin = createAsyncThunk(
  'machineControl/autoWorkOrigin/run',
  async (_, { dispatch, getState, signal }) => {
    dispatch(autoWorkOriginActions.setRunning(true));
    const zStep = (getState() as RootState).machineControl.autoWorkOrigin.zStep;
    let switchTrigger = false;
    let killed = false;
    function onSwitchTrigger() {
      switchTrigger = true;
    }
    function onRequestKill() {
      killed = true;
    }
    signal.onabort = onRequestKill;
    ipcRenderer.on('serial/switchTrigger', onSwitchTrigger);
    while (!switchTrigger && !killed) {
      dispatch(
        sendMachineCommand({
          cmd: SERIAL_COMMAND.MOVE_REL,
          params: { z: -1 * Math.abs(zStep) },
        })
      );
      while ((getState() as RootState).serial.runningCommand) {
        await sleep(500);
      }
    }
    if (killed) {
      dispatch(autoWorkOriginActions.setRunning(false));
      return;
    }
    console.log('switch triggered');
    dispatch(sendMachineCommand({ cmd: SERIAL_COMMAND.SET_WORK }));
    while ((getState() as RootState).serial.runningCommand) {
      await sleep(500);
    }
    ipcRenderer.off('serial/switchTrigger', onSwitchTrigger);
    dispatch(autoWorkOriginActions.setRunning(false));
  }
);
