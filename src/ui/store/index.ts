import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistReducer,
  REGISTER,
  REHYDRATE,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import calibrationReducer from './reducers/Calibration.reducer';
import serialReducer from './reducers/Serial.reducer';
import machineControlReducer from './reducers/MachineControl.reducer';
import gcodeReducer from './reducers/GCode.reducer';

const reducers = combineReducers({
  calibration: persistReducer(
    {
      key: 'calibration',
      storage,
      blacklist: ['state'],
    },
    calibrationReducer
  ),
  serial: persistReducer(
    {
      key: 'serial',
      storage,
      blacklist: [
        'availablePorts',
        'cncConnecting',
        'cncConnected',
        'switchConnecting',
        'switchConnected',
      ],
    },
    serialReducer
  ),
  machineControl: persistReducer(
    {
      key: 'machineControl',
      storage,
      blacklist: ['machineInfo', 'autoWorkOrigin.running'],
    },
    machineControlReducer
  ),
  gcode: persistReducer(
    {
      key: 'gcode',
      storage,
      blacklist: ['contourRunning', 'contourDone'],
    },
    gcodeReducer
  ),
});

// https://github.com/reduxjs/redux-toolkit/issues/1831
export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'calibration/saveRunPtr',
        ],
        ignoredPaths: ['calibration.__runPtr'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
