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
import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';
import { Room } from './entity/room.entity';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    private readonly userService: UserService,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
  ) {}

  // WEB SOCKET HANDLERS (START)

  async createRoom(client: Socket, payload: CreateRoomDto) {
    try {
      const { participants, ...rest } = payload;
      const newRoom = await this.roomRepository.save({
        ...rest,
        createdBy: client.data.user.id,
        updatedBy: client.data.user.id,
      });

      const savedRoom = await this.roomRepository.findOne({
        where: { id: newRoom.id },
        relations: ['participants'],
      });

      participants.forEach(async (participant) => {
        const user = (await this.userService.findOne(participant)) as User;
        savedRoom.participants.push(user);
      });

      const roomCreator = (await this.userService.findOne(
        client.data.user.id,
      )) as User;

      savedRoom.participants.push(roomCreator);

      const room = await this.roomRepository.save(savedRoom);
      await client.join(room.id);
    } catch (error) {
      this.logger.error(
        `Cannot create room for socket ${client.id}: ${error.message}`,
      );
      handleWsError(client, error);
    }
  }

  async joinRooms(client: Socket) {
    const userId = client.data.user.id;
    const rooms = await this.findAllRoomsByUser(userId);

    rooms.forEach(async (room) => {
      await client.join(room.id);
    });
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
