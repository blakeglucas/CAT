import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type AutoHomeState = {
  zStep: number;
  running: boolean;
};

const initialState: AutoHomeState = {
  zStep: 1,
  running: false,
};

export const autoHomeSlice = createSlice({
  name: 'autoHome',
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

export const autoHomeActions = autoHomeSlice.actions;

export default autoHomeSlice.reducer;
