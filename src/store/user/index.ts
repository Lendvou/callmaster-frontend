import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from 'types';

export interface IUserState {
  token: string;
  isAuth: boolean;
  user: IUser;
}

const initialState: IUserState = {
  token: '',
  isAuth: false,
  user: {} as IUser,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthData: (state, { payload }: PayloadAction<IUserState>) => {
      return payload;
    },
    resetAuthData: () => {
      return initialState;
    },
    setUser: (state, { payload }: PayloadAction<IUserState['user']>) => {
      state.user = payload;
    },
  },
});

export const { setAuthData, resetAuthData, setUser } = userSlice.actions;

export default userSlice.reducer;
