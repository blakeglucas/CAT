import { createAsyncThunk } from '@reduxjs/toolkit';
import { SERIAL_COMMAND, SERIAL_PARAMS } from '../../../shared/marlin';
import { RootState } from '..';
import { sendSerialCommand } from './serial.thunk';
import { sleep } from '../../utils/sleep';
import {
  calibrationActions,
  CALIBRATION_STATE,
} from '../reducers/calibration.reducer';
import { parsePosition } from '../../utils/parsePosition';

const { ipcRenderer } = window.require('electron');

export const runCalibration = createAsyncThunk(
  'calibration/run',
  async (_, { dispatch, getState, signal }) => {
    async function sendCommand(cmd: SERIAL_COMMAND, params?: SERIAL_PARAMS) {
      const value = await dispatch(sendSerialCommand({ cmd, params }));
      // TODO check if unneeded
      while ((getState() as RootState).serial.runningCommand) {
        await sleep(500);
      }
      return value.payload as string | undefined;
    }

    const params = (getState() as RootState).calibration;
    const dX = params.xDim / (params.xPoints - 1);
    const dY = params.yDim / (params.yPoints - 1);

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

    while (cY <= params.yDim && !killed) {
      dispatch(calibrationActions.resetRowMap());
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
        const position = parsePosition(rawPosition)
        dispatch(calibrationActions.appendToRowMap([cX, cY, position[2]]));
        cX += dX;
      }
      if (killed) {
        break;
      }
      cY += dY;
      const rowMap = (getState() as RootState).calibration.rowMap;
      dispatch(calibrationActions.appendToHeightMap(rowMap));
      if (killed) {
        break
      }
      if (cY >= params.yDim) {
        await sendCommand(SERIAL_COMMAND.MOVE_REL, {
          z: 15,
        });
      } else {
        cX = 0;
        await sendCommand(SERIAL_COMMAND.MOVE_ABS, {
          z: params.zTrav,
        });
        await sendCommand(SERIAL_COMMAND.MOVE_ABS, { y: cY })
      }
    }

    ipcRenderer.off('serial/switchTrigger', onSwitchTrigger)

    dispatch(calibrationActions.setState(CALIBRATION_STATE.IDLE))
  }
);
