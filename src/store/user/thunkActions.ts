import apiClient from 'utils/apiClient';

import { setAuthData, resetAuthData, setUser } from 'store/user';

import { PromiseThunk } from 'store/types';
import { IUser } from 'types';

export const checkIsUserAuth = (): PromiseThunk<IUser> => async (dispatch) => {
  const { accessToken, user: currentUser } = await apiClient.reAuthenticate();

  dispatch(
    setAuthData({
      isAuth: true,
      token: accessToken,
      user: currentUser,
    })
  );
  return currentUser as IUser;
};

export type LoginValues = {
  email: string;
  password: string;
};
export const logIn =
  (values: LoginValues): PromiseThunk =>
  async (dispatch) => {
    const { accessToken, user: currentUser } = await apiClient.authenticate({
      email: values.email,
      password: values.password,
      strategy: 'local',
    });

    dispatch(
      setAuthData({
        isAuth: true,
        token: accessToken,
        user: currentUser,
      })
    );
  };

export const logOut = (): PromiseThunk<any> => async (dispatch) => {
  await apiClient.logout();
  dispatch(resetAuthData());
};

export const patchUser =
  (values: Partial<IUser>): PromiseThunk<IUser> =>
  async (dispatch, getState) => {
    const userId = getState().user.user;

    const response: IUser = await apiClient.service('users').patch(userId, values);
    dispatch(setUser(response));

    return response;
  };
