import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type AutoHomeState = {
  zStep: number;
  zTrav: number;
  running: boolean;
};

const initialState: AutoHomeState = {
  zStep: 0.05,
  zTrav: 0.5,
  running: false,
};

export const autoHomeSlice = createSlice({
  name: 'autoHome',
  initialState,
  reducers: {
    setZStep(state, action: PayloadAction<number>) {
      state.zStep = action.payload;
    },
    setZTrav(state, action: PayloadAction<number>) {
      state.zTrav = action.payload
    },
    setRunning(state, action: PayloadAction<boolean>) {
      state.running = action.payload;
    },
  },
});

export const autoHomeActions = autoHomeSlice.actions;

export default autoHomeSlice.reducer;
