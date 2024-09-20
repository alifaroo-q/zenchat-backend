import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { CreateRoomDto } from '../chat/dto/create-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entity/room.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { handleWsError } from 'src/utils/app/ws-error-handler';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

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
        const user = await this.userRepository.findOneBy({ id: participant });
        savedRoom.participants.push(user);
      });

      const roomCreator = await this.userRepository.findOneBy({
        id: client.data.user.id,
      });

      savedRoom.participants.push(roomCreator);

      const room = await this.roomRepository.save(savedRoom);
      await client.join(room.id);

      return room;
    } catch (error) {
      this.logger.error(
        `Cannot create room for socket ${client.id}: ${error.message}`,
      );
      handleWsError(client, error);
    }
  }

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

  

  async joinRooms(client: Socket) {
    const userId = client.data.user.id;
    const rooms = await this.findAllRoomsByUser(userId);

    rooms.forEach(async (room) => {
      await client.join(room.id);
    });
  }
}
