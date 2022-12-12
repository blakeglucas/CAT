import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '..';
import { gcodeActions, prepContourSelector } from '../reducers/GCode.reducer';

const { ipcRenderer } = window.require('electron');

export const contourGCode = createAsyncThunk(
  'gcode/contour',
  async (_, { dispatch, getState }) => {
    const { raw, zDepth, heightMap } = prepContourSelector(
      getState() as RootState
    );
    dispatch(gcodeActions.setContourDone(false));
    dispatch(gcodeActions.setContourRunning(true));
    dispatch(gcodeActions.setErrors(undefined));
    await new Promise((resolve) => {
      ipcRenderer.once('gcode/contour', (_, [cgcode, errors]: string[]) => {
        console.log(errors);
        dispatch(gcodeActions.setCGCode(cgcode));
        dispatch(gcodeActions.setErrors(errors));
        dispatch(gcodeActions.setContourDone(true));
        dispatch(gcodeActions.setContourRunning(false));
        resolve(cgcode);
      });
      ipcRenderer.send('gcode/contour', raw, zDepth, heightMap.flat());
    });
  }
);
