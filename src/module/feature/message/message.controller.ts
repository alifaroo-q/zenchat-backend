import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/module/core/auth/guard/jwt-auth.guard';
import { MessageService } from './message.service';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/room/:roomId')
  async findAllByRoomId(@Param('roomId') roomId: string) {
    return this.messageService.findAllByRoomId(roomId);
  }
}
