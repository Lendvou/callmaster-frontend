import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import io from 'socket.io-client';
import auth from '@feathersjs/authentication-client';

export const host = process.env.REACT_APP_API_URL || 'http://localhost:3030';

const socket = io(host, {
  // transports: ['polling', 'websocket'],
  transports: ['polling'],
  path: process.env.REACT_APP_SOCKET_URL || '/socket.io',
});

const apiClient = feathers()
  .configure(socketio(socket))
  .configure(
    auth({
      storageKey: 'token',
    })
  );

export default apiClient;
