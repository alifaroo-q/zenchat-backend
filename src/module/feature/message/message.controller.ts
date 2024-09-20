import { Controller, Get, Param } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/room/:roomId')
  async findAllByRoomId(@Param('roomId') roomId: string) {
    return this.messageService.findAllByRoomId(roomId);
  }
}
