import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { CreateRoomDto } from './dto/create-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entity/room.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
  ) {}

  createRoom(client: Socket, payload: CreateRoomDto) {
    const { participants, ...rest } = payload;
    const newRoom = this.roomRepository.create({
      ...rest,
      createdBy: client.data.user.id,
    });
  }
}
