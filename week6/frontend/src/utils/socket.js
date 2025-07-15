import { io } from 'socket.io-client';
import { getUserFromToken } from './auth';

let socket;

export function connectSocket() {
  const user = getUserFromToken();
  if (!socket && user?.id) {
    socket = io('http://localhost:4000', {
      query: { userId: user.id },
      autoConnect: true,
    });
  }
  return socket;
}

export { socket };