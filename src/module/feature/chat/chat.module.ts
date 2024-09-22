import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/module/core/auth/auth.module';
import { Message } from '../message/entity/message.entity';
import { MessageModule } from '../message/message.module';
import { RoomModule } from '../room/room.module';
import { User } from '../user/entity/user.entity';
import { UserModule } from '../user/user.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    AuthModule,
    UserModule,
    RoomModule,
    MessageModule,
    TypeOrmModule.forFeature([User, Message]),
  ],
  providers: [ChatGateway],
})
export class ChatModule {}
