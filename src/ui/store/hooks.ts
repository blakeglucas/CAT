import {
  useDispatch as rawUseDispatch,
  useSelector as rawUseSelector,
} from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '.';

export const useDispatch: () => AppDispatch = rawUseDispatch;
export const useSelector: TypedUseSelectorHook<RootState> = rawUseSelector;
