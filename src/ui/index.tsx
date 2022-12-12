import React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store';
import SnackbarProvider from 'react-simple-snackbar';

import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

const persistor = persistStore(store);

ReactDOM.createRoot(document.getElementById('app-root')).render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </PersistGate>
  </Provider>
);
