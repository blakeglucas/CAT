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

import calibrationReducer from './reducers/calibration.reducer';
import serialReducer from './reducers/serial.reducer';
import autoHomeReducer from './reducers/auto-home.reducer';

const reducers = combineReducers({
  calibration: persistReducer(
    {
      key: 'calibration',
      storage,
      blacklist: [],
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
  autoHome: persistReducer(
    {
      key: 'autoHome',
      storage,
      blacklist: ['running'],
    },
    autoHomeReducer
  ),
});

// https://github.com/reduxjs/redux-toolkit/issues/1831
export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
