import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/module/core/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { User } from '../user/entity/user.entity';
import { Message } from '../message/entity/message.entity';
import { RoomModule } from '../room/room.module';
import { MessageModule } from '../message/message.module';

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
