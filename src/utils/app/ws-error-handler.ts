import { Socket } from 'socket.io';
import { WS_SEVER_EVENTS } from 'src/enum/ws-events.enum';
import { WS_STATUS } from 'src/enum/ws-status.enum';

export const handleWsError = (
  socket: Socket,
  error: Error,
  disconnect: boolean = true,
): void => {
  socket.emit(WS_SEVER_EVENTS.EXCEPTION, {
    status: WS_STATUS.ERROR,
    message: `Error: ${error.message}`,
  });
  if (disconnect) socket.disconnect();
};
