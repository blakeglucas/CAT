import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type AutoWorkOriginState = {
  zStep: number;
  running: boolean;
};

const initialState: AutoWorkOriginState = {
  zStep: 0.05,
  running: false,
};

export const autoWorkOriginSlice = createSlice({
  name: 'autoWorkOrigin',
  initialState,
  reducers: {
    setZStep(state, action: PayloadAction<number>) {
      state.zStep = action.payload;
    },
    setRunning(state, action: PayloadAction<boolean>) {
      state.running = action.payload;
    },
  },
});

export const autoWorkOriginActions = autoWorkOriginSlice.actions;

export default autoWorkOriginSlice.reducer;
