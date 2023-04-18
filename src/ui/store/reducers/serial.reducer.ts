import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';
import { CALIBRATION_STATE } from './calibration.reducer';

export type SerialState = {
  cncPort?: string;
  cncBaud: number;
  switchPort?: string;
  switchBaud: number;
  cncConnected: boolean;
  switchConnected: boolean;
  availablePorts: string[];
  cncConnecting: boolean;
  switchConnecting: boolean;
  portsLoading: boolean;
  runningCommand: boolean;
};

const initialState: SerialState = {
  cncBaud: 115200,
  switchBaud: 115200,
  cncConnected: false,
  switchConnected: false,
  availablePorts: [],
  cncConnecting: false,
  switchConnecting: false,
  portsLoading: false,
  runningCommand: false,
};

export const serialSlice = createSlice({
  name: 'serial',
  initialState,
  reducers: {
    setCncPort(state, action: PayloadAction<string | undefined>) {
      state.cncPort = action.payload;
    },
    setSwitchPort(state, action: PayloadAction<string | undefined>) {
      state.switchPort = action.payload;
    },
    setCncBaud(state, action: PayloadAction<number>) {
      state.cncBaud = action.payload;
    },
    setSwitchBaud(state, action: PayloadAction<number>) {
      state.switchBaud = action.payload;
    },
    setCncConnected(state, action: PayloadAction<boolean>) {
      state.cncConnected = action.payload;
    },
    setSwitchConnected(state, action: PayloadAction<boolean>) {
      state.switchConnected = action.payload;
    },
    setAvailablePorts(state, action: PayloadAction<string[]>) {
      state.availablePorts = action.payload;
    },
    setCncConnecting(state, action: PayloadAction<boolean>) {
      state.cncConnecting = action.payload;
    },
    setSwitchConnecting(state, action: PayloadAction<boolean>) {
      state.switchConnecting = action.payload;
    },
    setPortsLoading(state, action: PayloadAction<boolean>) {
      state.portsLoading = action.payload;
    },
    setRunningCommand(state, action: PayloadAction<boolean>) {
      state.runningCommand = action.payload;
    },
  },
});

export const serialActions = serialSlice.actions;

export const serialReadySelector = createSelector(
  (state: RootState) => ({
    serial: state.serial,
    calState: state.calibration.state,
  }),
  ({ serial, calState }) =>
    serial.cncPort &&
    serial.switchPort &&
    serial.cncConnected &&
    serial.switchConnected &&
    // !serial.runningCommand &&
    calState === CALIBRATION_STATE.IDLE
);

export const cncReadySelector = createSelector(
  (state: RootState) => ({
    serial: state.serial,
    calState: state.calibration.state,
  }),
  ({ serial, calState }) =>
    serial.cncPort &&
    serial.cncConnected &&
    // !serial.runningCommand &&
    calState === CALIBRATION_STATE.IDLE
);

export default serialSlice.reducer;
