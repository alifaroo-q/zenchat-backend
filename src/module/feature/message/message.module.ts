import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entity/message.entity';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { UserModule } from '../user/user.module';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), UserModule, RoomModule],
  providers: [MessageService],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
