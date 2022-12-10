import { createAsyncThunk } from '@reduxjs/toolkit';
import { UI_SERIAL_COMMAND } from '../../../shared/marlin';
import { RootState } from '..';
import { sendSerialCommand } from './serial.thunk';
import { sleep } from '../../utils/sleep';
import { autoHomeActions } from '../reducers/auto-home.reducer';

const { ipcRenderer } = window.require('electron');

export const runAutoHome = createAsyncThunk(
  'autoHome/run',
  async (_, { dispatch, getState, signal }) => {
    dispatch(autoHomeActions.setRunning(true));
    const zStep = (getState() as RootState).autoHome.zStep;
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
        sendSerialCommand({
          cmd: UI_SERIAL_COMMAND.MOVE_REL,
          params: { z: -1 * Math.abs(zStep) },
        })
      );
      while ((getState() as RootState).serial.runningCommand) {
        await sleep(500);
      }
    }
    if (killed) {
      dispatch(autoHomeActions.setRunning(false));
      return;
    }
    console.log('switch triggered');
    dispatch(sendSerialCommand({ cmd: UI_SERIAL_COMMAND.SET_WORK }));
    while ((getState() as RootState).serial.runningCommand) {
      await sleep(500);
    }
    dispatch(autoHomeActions.setRunning(false));
  }
);
