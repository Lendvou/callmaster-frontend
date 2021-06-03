import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Peer from 'peerjs';

export interface ICoreState {
  peer: Peer;
}

const initialState: ICoreState = {
  peer: {} as Peer,
};

const coreSlice = createSlice({
  name: 'core',
  initialState,
  reducers: {
    setPeer: (state, { payload }: PayloadAction<ICoreState['peer']>) => {
      state.peer = payload;
    },
  },
});

export const { setPeer } = coreSlice.actions;

export default coreSlice.reducer;
