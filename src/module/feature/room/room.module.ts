import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Room } from './entity/room.entity';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Room])],
  controllers: [RoomController],
  exports: [RoomService],
  providers: [RoomService],
})
export class RoomModule {}
