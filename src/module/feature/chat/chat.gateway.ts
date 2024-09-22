import { Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsExceptionFilter } from 'src/common/ws-exception.filter';
import { WS_CLIENT_EVENTS, WS_SEVER_EVENTS } from 'src/enum/ws-events.enum';
import { AuthService } from 'src/module/core/auth/auth.service';
import { WsValidationPipe } from 'src/pipes/ws-validation.pipe';
import { handleWsError } from 'src/utils/app/ws-error-handler';
import { MessageService } from '../message/message.service';
import { RoomService } from '../room/room.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';

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

  onModuleInit() {
    this.logger.log('ChatGateway initialized');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const authenticatedUser = this.authService.authenticateSocket(client);
      this.connectedUser.set(client.id, authenticatedUser.id);
      client.data.user = authenticatedUser;

      this.logger.log(`Client connected: ${authenticatedUser.id}`);
    } catch (error) {
      this.logger.error(
        `Connection error for socket ${client.id}: ${error.message}`,
      );
      handleWsError(client, error);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(
      `Client disconnected: ${this.connectedUser.get(client.id)}`,
    );
  }

  @SubscribeMessage(WS_SEVER_EVENTS.JOIN_ROOMS)
  async handleJoinRooms(@ConnectedSocket() client: Socket) {
    await this.roomService.joinRooms(client);
    return true;
  }

  @SubscribeMessage(WS_SEVER_EVENTS.CREATE_ROOM)
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) payload: CreateRoomDto,
  ) {
    await this.roomService.createRoom(client, payload);
    return true;
  }

  @SubscribeMessage(WS_SEVER_EVENTS.NEW_MESSAGE)
  async handleNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) payload: CreateMessageDto,
  ) {
    client
      .to(payload.roomId)
      .emit(WS_CLIENT_EVENTS.RECEIVED_MESSAGE, payload.message);

    await this.messageService.createNewMessageByRoomId(client, payload);
    return true;
  }
}
