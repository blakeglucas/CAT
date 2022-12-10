import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type CalibrationState = {
  xDim: number;
  yDim: number;
  xPoints: number;
  yPoints: number;
  zStep: number;
  zTrav: number;
  state: 0;
  cX: number;
  cY: number;
  rowMap: number[][];
  heightMap: number[][][];
};

const initialState: CalibrationState = {
  xDim: 20,
  yDim: 20,
  xPoints: 5,
  yPoints: 5,
  zStep: 0.1,
  zTrav: 1,
  state: 0,
  cX: 0,
  cY: 0,
  rowMap: [],
  heightMap: [],
};

export const calibrationSlice = createSlice({
  name: 'calibration',
  initialState,
  reducers: {
    moveX(state, action: PayloadAction<number>) {
      state.cX += action.payload;
    },
    resetX(state) {
      state.cX = 0;
    },
    moveY(state, action: PayloadAction<number>) {
      state.cY += action.payload;
    },
    resetY(state) {
      state.cY = 0;
    },
    appendToRowMap(state, action: PayloadAction<number[]>) {
      state.rowMap.push(action.payload);
    },
    resetRowMap(state) {
      state.rowMap = [];
    },
    appendToHeightMap(state, action: PayloadAction<number[][]>) {
      state.heightMap.push(action.payload);
    },
    resetHeightMap(state) {
      state.heightMap = [];
    },
  },
});

export const calibrationActions = calibrationSlice.actions;

export default calibrationSlice.reducer;
