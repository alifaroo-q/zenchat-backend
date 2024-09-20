import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/module/core/auth/auth.service';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly roomService: RoomService,
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
      this.handleConnectionError(client, error);
    }
  }

  private handleConnectionError(socket: Socket, error: Error): void {
    this.logger.error(
      `Connection error for socket ${socket.id}: ${error.message}`,
    );
    socket.emit('exception', 'Authentication error');
    socket.disconnect();
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('CreateRoom')
  handleCreateRoom(client: Socket, payload: CreateRoomDto) {
    return this.roomService.createRoom(client, payload);
  }
}
