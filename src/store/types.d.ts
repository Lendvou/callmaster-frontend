import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { ICoreState } from 'store/core';
import { IUserState } from 'store/user';

export interface RootState {
  core: ICoreState;
  user: IUserState;
}

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export type PromiseThunk<ReturnType = void> = ThunkAction<
  Promise<ReturnType>,
  RootState,
  unknown,
  Action<string>
>;
