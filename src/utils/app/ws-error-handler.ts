import { Socket } from 'socket.io';
import { WS_SEVER_EVENTS } from 'src/enum/ws-events.enum';
import { WS_STATUS } from 'src/enum/ws-status.enum';

export const handleWsError = (socket: Socket, error: Error): void => {
  socket.emit(WS_SEVER_EVENTS.EXCEPTION, {
    status: WS_STATUS.ERROR,
    message: `Authentication error: ${error.message}`,
  });
  socket.disconnect();
};
