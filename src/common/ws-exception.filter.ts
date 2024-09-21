import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WS_SEVER_EVENTS } from 'src/enum/ws-events.enum';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    client.emit(WS_SEVER_EVENTS.EXCEPTION, {
      status: 'error',
      message: exception.getError(),
    });
  }
}
