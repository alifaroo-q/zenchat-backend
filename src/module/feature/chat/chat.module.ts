import { Module } from '@nestjs/common';
import { AuthModule } from 'src/module/core/auth/auth.module';
import { MessageModule } from '../message/message.module';
import { RoomModule } from '../room/room.module';
import { UserModule } from '../user/user.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [AuthModule, UserModule, RoomModule, MessageModule],
  providers: [ChatGateway],
})
export class ChatModule {}
