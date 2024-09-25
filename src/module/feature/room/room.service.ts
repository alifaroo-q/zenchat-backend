import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { handleWsError } from 'src/utils/app/ws-error-handler';
import { Repository } from 'typeorm';
import { CreateRoomDto } from '../chat/dto/create-room.dto';
import { UserService } from '../user/user.service';
import { Room } from './entity/room.entity';
import { RoomTypeEnum } from 'src/enum/room-type.enum';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    private readonly userService: UserService,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
  ) {}

  // WEB SOCKET HANDLERS (START)

  async createRoom(client: Socket, payload: CreateRoomDto) {
    if (
      payload.type === RoomTypeEnum.DIRECT_CHAT &&
      payload.participants.length > 1
    ) {
      throw new WsException('Direct chat can have only one participant');
    }
    try {
      const { participants, ...rest } = payload;
      const newRoom = await this.roomRepository.save({
        ...rest,
        createdBy: client.data.user.id,
        updatedBy: client.data.user.id,
      });

      const participantUsers = await this.userService.findManyByIds([
        ...participants,
        client.data.user.id,
      ]);

      newRoom.participants = participantUsers;
      const room = await this.roomRepository.save(newRoom);

      if (payload.type === RoomTypeEnum.DIRECT_CHAT) {
        await this.userService.addFriend(client.data.user.id, participants[0]);
      }

      await client.join(room.id);
    } catch (error) {
      this.logger.error(
        `Cannot create room for socket ${client.data.user.id}: ${error.message}`,
      );
      handleWsError(client, error);
    }
  }

  async joinRooms(client: Socket) {
    try {
      const userId = client.data.user.id;
      const rooms = await this.findAllRoomsByUser(userId);
      await Promise.all(rooms.map((room) => client.join(room.id)));
    } catch (error) {
      this.logger.error(
        `Cannot join rooms for socket ${client.data.user.id}: ${error.message}`,
      );
      handleWsError(client, error);
    }
  }

  async joinSingleRoom(client: Socket, roomId: string) {
    try {
      await client.join(roomId);
    } catch (error) {
      this.logger.error(
        `Cannot join room "${roomId}" for socket ${client.data.user.id}: ${error.message}`,
      );
      handleWsError(client, error);
    }
  }

  // WEB SOCKET HANDLERS (END)

  // HTTP HANDLERS (START)

  async findAllRoomsByUser(userId: string) {
    try {
      const userRooms = await this.roomRepository.find({
        where: {
          participants: {
            id: userId,
          },
        },
      });

      return userRooms;
    } catch (error) {
      this.logger.error('An error occurred while finding rooms with user ID');
      throw new InternalServerErrorException(
        'An error occurred while finding rooms with provided user id',
      );
    }
  }

  async findOne(roomId: string) {
    try {
      const room = await this.roomRepository.findOneBy({ id: roomId });
      if (!room) {
        this.logger.warn(`Room with ID "${roomId}" not found`);
        throw new NotFoundException(`Room with ID "${roomId}" not found`);
      }

      return room;
    } catch (error) {
      this.logger.error('An error occurred while finding room');
      throw new InternalServerErrorException(
        'An error occurred while finding room with provided id',
      );
    }
  }

  // HTTP HANDLERS (END)
}
