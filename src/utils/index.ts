import { IChat, IUser } from 'types';

export const isEmail = (email: string) => {
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line
  return emailRegex.test(String(email).toLowerCase());
};

export const getRandomInteger = (min: number, max: number) =>
  Math.round(Math.random() * (max - min) + min);

export const getReceiver = (user: IUser): 'client' | 'operator' => {
  return user.role === 'client' ? 'operator' : 'client';
};

export const getUnreadMessages = (chat: IChat, user: IUser) =>
  chat[(user.role + 'UnreadMessages') as 'clientUnreadMessages' | 'operatorUnreadMessages'];
export const getUnreadMessagesKey = (user: IUser) =>
  (user.role + 'UnreadMessages') as 'clientUnreadMessages' | 'operatorUnreadMessages';
