import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entity/message.entity';
import { User } from '../user/entity/user.entity';
import { Room } from '../room/entity/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User, Room])],
  providers: [MessageService],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
