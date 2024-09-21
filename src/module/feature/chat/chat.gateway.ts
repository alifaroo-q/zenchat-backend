import { Logger, UseFilters } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/module/core/auth/auth.service';
import { RoomService } from '../room/room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { handleWsError } from 'src/utils/app/ws-error-handler';
import { MessageService } from '../message/message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { WsValidationPipe } from 'src/pipes/ws-validation.pipe';
import { WsExceptionFilter } from 'src/common/ws-exception.filter';
import { WS_CLIENT_EVENTS, WS_SEVER_EVENTS } from 'src/enum/ws-events.enum';

@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
  ) {}

  private connectedUser = new Map<string, string>();

  async onModuleInit(): Promise<void> {
    this.logger.log('ChatGateway initialized');
  }

  handleConnection(client: Socket) {
    try {
      const authenticatedUser = this.authService.authenticateSocket(client);
      this.connectedUser.set(client.id, authenticatedUser.id);
      client.data.user = authenticatedUser;

      this.logger.log(`${authenticatedUser.id} - Connected`);
    } catch (error) {
      this.logger.error(
        `Connection error for socket ${client.id}: ${error.message}`,
      );
      handleWsError(client, error);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(WS_SEVER_EVENTS.JOIN_ROOMS)
  handleJoinRooms(client: Socket) {
    return this.roomService.joinRooms(client);
  }

  @SubscribeMessage(WS_SEVER_EVENTS.CREATE_ROOM)
  handleCreateRoom(
    client: Socket,
    @MessageBody(new WsValidationPipe()) payload: CreateRoomDto,
  ) {
    return this.roomService.createRoom(client, payload);
  }

  @SubscribeMessage(WS_SEVER_EVENTS.NEW_MESSAGE)
  handleNewMessage(
    client: Socket,
    @MessageBody(new WsValidationPipe()) payload: CreateMessageDto,
  ) {
    client
      .to(payload.roomId)
      .emit(WS_CLIENT_EVENTS.RECEIVED_MESSAGE, payload.message);
    return this.messageService.createNewMessageByRoomId(client, payload);
  }
}
