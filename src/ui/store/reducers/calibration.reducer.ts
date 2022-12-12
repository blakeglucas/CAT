import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export enum CALIBRATION_STATE {
  IDLE = 0,
  RUNNING,
  STOPPING,
  STOPPED,
  PAUSED,
}

export type CalibrationState = {
  xDim: number;
  yDim: number;
  xPoints: number;
  yPoints: number;
  zStep: number;
  zTrav: number;
  state: CALIBRATION_STATE;
  cX: number;
  cY: number;
  rowMap: number[][];
  heightMap: number[][][];
  completed: boolean;
  __runPtr?: Promise<unknown>;
};

const initialState: CalibrationState = {
  xDim: 20,
  yDim: 20,
  xPoints: 5,
  yPoints: 5,
  zStep: 0.1,
  zTrav: 1,
  state: CALIBRATION_STATE.IDLE,
  cX: 0,
  cY: 0,
  rowMap: [],
  heightMap: [],
  completed: false,
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
    setState(state, action: PayloadAction<CALIBRATION_STATE>) {
      state.state = action.payload;
    },
    setXDim(state, action: PayloadAction<number>) {
      state.xDim = action.payload;
    },
    setYDim(state, action: PayloadAction<number>) {
      state.yDim = action.payload;
    },
    setXPoints(state, action: PayloadAction<number>) {
      state.xPoints = action.payload;
    },
    setYPoints(state, action: PayloadAction<number>) {
      state.yPoints = action.payload;
    },
    setZStep(state, action: PayloadAction<number>) {
      state.zStep = action.payload;
    },
    setZTrav(state, action: PayloadAction<number>) {
      state.zTrav = action.payload;
    },
    setCompleted(state, action: PayloadAction<boolean>) {
      state.completed = action.payload;
    },
    setHeightMap(state, action: PayloadAction<number[][][]>) {
      state.heightMap = action.payload;
    },
    saveRunPtr(state, action: PayloadAction<Promise<unknown>>) {
      state.__runPtr = action.payload;
    },
  },
});

export const calibrationActions = calibrationSlice.actions;

export default calibrationSlice.reducer;
