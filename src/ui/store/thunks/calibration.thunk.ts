import { createAsyncThunk } from '@reduxjs/toolkit';
import { SERIAL_COMMAND, SERIAL_PARAMS } from '../../../shared/marlin';
import { RootState } from '..';
import { sendMachineCommand } from './MachineControl.thunk';
import { sleep } from '../../utils/sleep';
import {
  calibrationActions,
  CALIBRATION_STATE,
} from '../reducers/Calibration.reducer';
import { parsePosition } from '../../utils/parsePosition';

const { ipcRenderer } = window.require('electron');

export type CalibrationThunkArgs = {
  resume?: boolean;
} | null;

const runCalibration = createAsyncThunk(
  'calibration/run',
  async (args: CalibrationThunkArgs, { dispatch, getState, signal }) => {
    async function sendCommand(cmd: SERIAL_COMMAND, params?: SERIAL_PARAMS) {
      const value = await dispatch(sendMachineCommand({ cmd, params }));
      // TODO check if unneeded
      while ((getState() as RootState).serial.runningCommand) {
        await sleep(500);
      }
      return value.payload as string | undefined;
    }

    console.log(args);

    dispatch(calibrationActions.setCompleted(false));
    if (!args?.resume) {
      dispatch(calibrationActions.resetX());
      dispatch(calibrationActions.resetY());
      dispatch(calibrationActions.resetRowMap());
      dispatch(calibrationActions.resetHeightMap());
    }

    const params = (getState() as RootState).calibration;

    // Clam to 2 decimal places to avoid weird JS decimal error propagation
    const dX = Number((params.xDim / (params.xPoints - 1)).toFixed(2));
    const dY = Number((params.yDim / (params.yPoints - 1)).toFixed(2));

    await sendCommand(SERIAL_COMMAND.GO_TO_ORIGIN_Z, {
      z: params.zTrav,
    });
    await sendCommand(SERIAL_COMMAND.MOVE_REL, {
      z: params.zTrav,
    });

    let switchTrigger = false;
    function onSwitchTrigger() {
      switchTrigger = true;
    }
    ipcRenderer.on('serial/switchTrigger', onSwitchTrigger);

    let killed = false;
    function onStopRequest() {
      killed = true;
    }
    signal.onabort = onStopRequest;

    dispatch(calibrationActions.setState(CALIBRATION_STATE.RUNNING));

    // TODO: prompt for auto home?

    let cX = params.cX;
    let cY = params.cY;

    console.log(cX, cY);

    while (cY <= params.yDim && !killed) {
      if (!args?.resume) {
        dispatch(calibrationActions.resetRowMap());
      }
      while (cX <= params.xDim && !killed) {
        await sendCommand(SERIAL_COMMAND.MOVE_ABS, {
          z: params.zTrav,
        });
        await sendCommand(SERIAL_COMMAND.MOVE_ABS, {
          x: cX,
        });
        await sleep(1500);
        switchTrigger = false;
        while (!switchTrigger && !killed) {
          await sendCommand(SERIAL_COMMAND.MOVE_REL, {
            z: -1 * Math.abs(params.zStep),
          });
          await sleep(500);
        }
        if (killed) {
          break;
        }
        switchTrigger = false;
        const rawPosition: string = await sendCommand(
          SERIAL_COMMAND.GET_POSITION
        );
        console.log(rawPosition);
        const position = parsePosition(rawPosition);
        dispatch(calibrationActions.appendToRowMap([cX, cY, position[2]]));
        dispatch(calibrationActions.moveX(dX));
        cX += dX;
      }
      if (killed) {
        break;
      }
      cY += dY;
      dispatch(calibrationActions.moveY(dY));
      const rowMap = (getState() as RootState).calibration.rowMap;
      dispatch(calibrationActions.appendToHeightMap(rowMap));
      if (killed) {
        break;
      }
      if (cY > params.yDim) {
        await sendCommand(SERIAL_COMMAND.MOVE_REL, {
          z: 15,
        });
        dispatch(calibrationActions.resetX());
        dispatch(calibrationActions.resetY());
        dispatch(calibrationActions.setCompleted(true));
      } else {
        dispatch(calibrationActions.resetX());
        cX = 0;
        await sendCommand(SERIAL_COMMAND.MOVE_ABS, {
          z: params.zTrav,
        });
        await sendCommand(SERIAL_COMMAND.MOVE_ABS, { y: cY });
      }
    }

    ipcRenderer.off('serial/switchTrigger', onSwitchTrigger);

    dispatch(calibrationActions.setState(CALIBRATION_STATE.IDLE));
  }
);

export const safelyStartCalibration = createAsyncThunk(
  'calibration/safeStart',
  async (args: CalibrationThunkArgs, { dispatch }) => {
    const runPtr = dispatch(runCalibration(args));
    dispatch(calibrationActions.saveRunPtr(runPtr));
  }
);

export const safelyStopCalibration = createAsyncThunk(
  'calibration/safeStop',
  async (_, { getState }) => {
    const runPtr = (getState() as RootState).calibration.__runPtr;
    if (runPtr) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      runPtr.abort();
      while (
        (getState() as RootState).calibration.state !== CALIBRATION_STATE.IDLE
      ) {
        await sleep(500);
      }
    }
  }
);
