import { createAsyncThunk, createDraftSafeSelector } from '@reduxjs/toolkit';
import { RootState } from '..';
import {
  calibrationActions,
  CALIBRATION_STATE,
} from '../reducers/Calibration.reducer';
import { safelyStopCalibration } from './Calibration.thunk';

const { ipcRenderer } = window.require('electron');

// const projectDataSelector = createSelector((state: RootState) => {})
const heightMapSelector = createDraftSafeSelector(
  (state: RootState) => state,
  (state: RootState) => ({
    metadata: {
      xDim: state.calibration.xDim,
      xPoints: state.calibration.xPoints,
      yDim: state.calibration.yDim,
      yPoints: state.calibration.yPoints,
    },
    heightMap: state.calibration.heightMap,
  })
);

// export const newProjectThunk = createAsyncThunk(
//   'menu/newProject',
//   async () => {}
// );

// export type SaveProjectThunkArgs =
//   | {
//       as?: boolean;
//     }
//   | undefined;

// export const saveProjectThunk = createAsyncThunk(
//   'menu/saveProject',
//   async ({ as }: SaveProjectThunkArgs) => {}
// );

export default createAsyncThunk('menu', async (_, { dispatch, getState }) => {
  //   ipcRenderer.on('menu/newProject', () => {
  //     dispatch(newProjectThunk());
  //   }),
  //     ipcRenderer.on('menu/saveProject', () => {
  //       dispatch(saveProjectThunk(undefined));
  //     });
  //   ipcRenderer.on('menu/saveProjectAs', () => {
  //     dispatch(saveProjectThunk({ as: true }));
  //   });
  ipcRenderer.on(
    'menu/openHeightMap',
    async (event, hmData: ReturnType<typeof heightMapSelector>) => {
      if (
        (getState() as RootState).calibration.state !== CALIBRATION_STATE.IDLE
      ) {
        await dispatch(safelyStopCalibration());
      }
      dispatch(calibrationActions.setXDim(hmData.metadata.xDim));
      dispatch(calibrationActions.setYDim(hmData.metadata.yDim));
      dispatch(calibrationActions.setXPoints(hmData.metadata.xPoints));
      dispatch(calibrationActions.setYPoints(hmData.metadata.yPoints));
      dispatch(calibrationActions.resetX());
      dispatch(calibrationActions.resetY());
      dispatch(calibrationActions.resetRowMap());
      dispatch(calibrationActions.setHeightMap(hmData.heightMap));
    }
  );
  //   ipcRenderer.on('menu/openGCode', (event, gcode) => {});
  ipcRenderer.on('menu/saveHeightMap', () => {
    const hmData = heightMapSelector(getState() as RootState);
    ipcRenderer.send('menu/saveHeightMap', hmData);
  });
  //   ipcRenderer.on('menu/saveGCode', () => {});
});
