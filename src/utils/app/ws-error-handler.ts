import { Socket } from 'socket.io';

export const handleWsError = (socket: Socket, error: Error): void => {
  socket.emit('exception', 'Authentication error');
  socket.disconnect();
};
