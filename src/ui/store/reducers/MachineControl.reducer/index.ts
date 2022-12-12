import { combineReducers, createSlice, PayloadAction } from '@reduxjs/toolkit';

import AutoWorkOriginReducer, { autoWorkOriginActions } from './AutoWorkOrigin.reducer';
import MachineInfoReducer, { machineInfoActions } from './MachineInfo.reducer';

const initialState = {
    homing: false
}

const slice = createSlice({
    name: 'machineControl',
    initialState,
    reducers: {
        setHoming(state, action: PayloadAction<boolean>) {
            state.homing = action.payload
        }
    }
})

const machineControlReducer = combineReducers({
    autoWorkOrigin: AutoWorkOriginReducer,
    machineInfo: MachineInfoReducer,
    machineControl: slice.reducer,
})

export default machineControlReducer

export const machineControlActions = {
    autoWorkOriginActions,
    machineInfoActions,
    ...slice.actions
}