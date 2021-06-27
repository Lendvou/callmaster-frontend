import Peer from 'peerjs';
import { AppThunk } from 'store/types';
import { setPeer } from 'store/core';

export const initPeer = (): AppThunk => async (dispatch, getState) => {
  const user = getState().user.user;

  if (!user || !user._id) return;

  const myPeer = new Peer(user._id, {
    host: process.env.REACT_APP_IP || 'localhost',
    port: 80,
    path: process.env.REACT_APP_PEERJS_PATH || '/peerjs',
  });

  dispatch(setPeer(myPeer));
  return myPeer;
};
