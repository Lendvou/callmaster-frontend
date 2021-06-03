import Peer from 'peerjs';
import { AppThunk } from 'store/types';
import { setPeer } from 'store/core';

export const initPeer = (): AppThunk => async (dispatch, getState) => {
  const user = getState().user.user;

  if (!user || !user._id) return;

  const myPeer = new Peer(user._id, {
    host: 'localhost',
    port: 3030,
    path: '/peerjs',
  });

  dispatch(setPeer(myPeer));
  return myPeer;
};
