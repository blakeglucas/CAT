/* eslint-disable @typescript-eslint/no-namespace */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type MachineInfoState = {
  coordinates: [number, number, number];
  coordinatesIntervalRef?: NodeJS.Timeout;
};

const initialState: MachineInfoState = {
  coordinates: [0, 0, 0],
};

export const machineInfoSlice = createSlice({
  name: 'machineInfo',
  initialState,
  reducers: {
    setCoordinates(state, action: PayloadAction<[number, number, number]>) {
      state.coordinates = action.payload;
    },
    setCoordinatesIntervalRef(
      state,
      action: PayloadAction<NodeJS.Timeout | undefined>
    ) {
      state.coordinatesIntervalRef = action.payload;
    },
  },
});

export const machineInfoActions = machineInfoSlice.actions;

export default machineInfoSlice.reducer;
