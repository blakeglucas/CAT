import { createAsyncThunk } from '@reduxjs/toolkit';
import { SERIAL_COMMAND, SERIAL_PARAMS } from '../../../shared/marlin';
import { serialActions } from '../reducers/serial.reducer';

const { ipcRenderer } = window.require('electron');

export const getSerialPorts = createAsyncThunk(
  'serial/getPorts',
  async (_, { dispatch }) => {
    return await new Promise<void>((resolve, reject) => {
      dispatch(serialActions.setPortsLoading(true));
      ipcRenderer.once('serial/getPorts', (event, ports: string[]) => {
        console.log(event, ports);
        dispatch(serialActions.setAvailablePorts(ports));
        dispatch(serialActions.setPortsLoading(false));
        resolve();
      });
      ipcRenderer.send('serial/getPorts');
    });
  }
);

type SerialConnectPayload = {
  port: string;
  baud: number;
  portType: 'cnc' | 'switch';
  action: 'connect' | 'disconnect';
};

export const manageSerialPort = createAsyncThunk(
  'serial/managePort',
  async (
    { port, baud, portType, action }: SerialConnectPayload,
    { dispatch }
  ) => {
    return await new Promise<void>((resolve, reject) => {
      const connectingAction =
        portType === 'cnc'
          ? serialActions.setCncConnecting
          : serialActions.setSwitchConnecting;
      const connectedAction =
        portType === 'cnc'
          ? serialActions.setCncConnected
          : serialActions.setSwitchConnected;
      dispatch(connectingAction(true));
      const eventName =
        action === 'connect' ? 'serial/connectPort' : 'serial/disconnectPort';
      ipcRenderer.once(eventName, (event, err?: string, result?: boolean) => {
        dispatch(connectingAction(false));
        if (err) {
          console.error(err);
          reject(err);
        } else {
          dispatch(connectedAction(result));
        }
        resolve();
      });
      ipcRenderer.send(eventName, port, baud, portType);
    });
  }
);

type SerialCommandPayload = {
  cmd: SERIAL_COMMAND;
  params?: SERIAL_PARAMS;
};

export const sendSerialCommand = createAsyncThunk(
  'serial/sendCommand',
  async ({ cmd, params }: SerialCommandPayload, { dispatch }) => {
    dispatch(serialActions.setRunningCommand(true));
    return await new Promise<string | undefined>((resolve, reject) => {
      ipcRenderer.once('serial/sendCommand', (event, err?: string, result?: string) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          dispatch(serialActions.setRunningCommand(false));
          resolve(result);
        }
      });
      ipcRenderer.send('serial/sendCommand', cmd, params);
    });
  }
);

export const getCurrentMachinePosition = createAsyncThunk(
  'serial/getCurrentMachinePosition',
  async (_, {dispatch}) => {
    dispatch(serialActions.setRunningCommand(true));
    return await dispatch(sendSerialCommand({ cmd: SERIAL_COMMAND.GET_POSITION }))
  }
)