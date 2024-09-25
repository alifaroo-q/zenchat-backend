import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { RoomService } from '../room/room.service';
import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';
import { Message } from './entity/message.entity';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly userService: UserService,
    private readonly roomService: RoomService,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async createNewMessageByRoomId(client: Socket, payload: any) {
    try {
      const user = (await this.userService.findOne(
        client.data.user.id,
      )) as User;

      const room = await this.roomService.findOne(payload.roomId);

      const message = this.messageRepository.create({
        creator: user,
        room,
        text: payload.message,
      });

      return await this.messageRepository.save(message);
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
