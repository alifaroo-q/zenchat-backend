import { Socket } from 'socket.io';
import { WS_SEVER_EVENTS } from 'src/enum/ws-events.enum';

export const handleWsError = (socket: Socket, error: Error): void => {
  socket.emit(WS_SEVER_EVENTS.EXCEPTION, {
    status: 'error',
    message: `Authentication error: ${error.message}`,
  });
  socket.disconnect();
};
