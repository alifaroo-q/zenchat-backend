import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/module/core/auth/auth.module';
import { RoomService } from './room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entity/room.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Room])],
  providers: [ChatGateway, RoomService],
})
export class ChatModule {}
