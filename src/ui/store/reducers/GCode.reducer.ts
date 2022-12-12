import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type GCodeState = {
  raw?: string;
  contoured?: string;
  zDepth: number;
};

const initialState: GCodeState = {
  zDepth: -0.05,
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
  },
});

export const gcodeActions = gcodeSlice.actions;

export default gcodeSlice.reducer;
