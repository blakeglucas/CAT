import {
  createSlice,
  PayloadAction,
  createDraftSafeSelector,
} from '@reduxjs/toolkit';
import { RootState } from '..';

export type GCodeState = {
  raw?: string;
  contoured?: string;
  zDepth: number;
  contourRunning: boolean;
  contourDone: boolean;
  errors?: string;
};

const initialState: GCodeState = {
  zDepth: -0.05,
  contourRunning: false,
  contourDone: false,
};

export const gcodeSlice = createSlice({
  name: 'gcode',
  initialState,
  reducers: {
    setRawGCode(state, action: PayloadAction<string>) {
      state.raw = action.payload;
    },
    setCGCode(state, action: PayloadAction<string>) {
      state.contoured = action.payload;
    },
    setZDepth(state, action: PayloadAction<number>) {
      state.zDepth = action.payload;
    },
    setContourRunning(state, action: PayloadAction<boolean>) {
      state.contourRunning = action.payload;
    },
    setContourDone(state, action: PayloadAction<boolean>) {
      state.contourDone = action.payload;
    },
    setErrors(state, action: PayloadAction<string | undefined>) {
      state.errors = action.payload;
    },
  },
});

export const gcodeActions = gcodeSlice.actions;

export default gcodeSlice.reducer;

export const prepContourSelector = createDraftSafeSelector(
  (state: RootState) => state,
  (state: RootState) => ({
    raw: state.gcode.raw,
    zDepth: state.gcode.zDepth,
    heightMap: state.calibration.heightMap,
  })
);
