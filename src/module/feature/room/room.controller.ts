import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/module/core/auth/decorator/current-user.decorator';
import { JwtAuthGuard } from 'src/module/core/auth/guard/jwt-auth.guard';
import { UserPayload } from 'src/types/user-payload.type';
import { RoomService } from './room.service';

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async findAllRoomsByUser(@CurrentUser() currentUser: UserPayload) {
    return this.roomService.findAllRoomsByUser(currentUser.id);
  }
}
