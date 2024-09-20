import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entity/message.entity';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';
import { User } from '../user/entity/user.entity';
import { Room } from '../room/entity/room.entity';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async createNewMessageByRoomId(client: Socket, payload: any) {
    try {
      const user = await this.userRepository.findOneBy({
        id: client.data.user.id,
      });

      const room = await this.roomRepository.findOneBy({ id: payload.roomId });

      const message = this.messageRepository.create({
        creator: user,
        room,
        text: payload.message,
      });

      await this.messageRepository.save(message);
    } catch (error) {
      this.logger.error('An error occurred while creating message');
      throw new InternalServerErrorException(
        'An error occurred while creating message',
      );
    }
  }

  async findAllByRoomId(roomId: string) {
    try {
      const messages = await this.messageRepository.find({
        where: {
          roomId,
        },
      });

      return messages;
    } catch (error) {
      this.logger.error(
        'An error occurred while finding messages with room ID',
      );
      throw new InternalServerErrorException(
        'An error occurred while finding messages with provided room id',
      );
    }
  }
}
