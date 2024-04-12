import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {RootAction, RootState} from '@state/store';

export const useAppDispatch: () => RootAction = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
