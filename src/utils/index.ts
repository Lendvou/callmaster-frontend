import { IUser } from 'types';

export const getUser = (): IUser => {
  const userJson = localStorage.getItem('user');
  const user: IUser = userJson ? JSON.parse(userJson as string) : null;

  return user;
};

type AuthData = {
  user: IUser;
  accessToken: string;
};

export const setAuthData = (data: AuthData | null) => {
  if (data == null) {
    localStorage.setItem('isAuth', '0');
    localStorage.setItem('token', '');
    localStorage.setItem('user', '');
  } else {
    localStorage.setItem('isAuth', '1');
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};

export const getToken = (): string | null => {
  const token = localStorage.getItem('token');
  return token;
};

export const isUserAuth = (): boolean => {
  const isAuth = localStorage.getItem('isAuth') === '1';
  return isAuth;
};

export const isEmail = (email: string) => {
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line
  return emailRegex.test(String(email).toLowerCase());
};
