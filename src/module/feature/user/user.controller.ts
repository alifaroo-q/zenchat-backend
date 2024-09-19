import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { UserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard } from 'src/module/core/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/module/core/auth/decorator/current-user.decorator';
import { UserPayload } from 'src/types/user-payload.type';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<UserDto[]> {
    return await this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserDto> {
    return await this.userService.findOne(id);
  }

  @Get('/search/:searchTerm')
  async findAllBySearchTerm(
    @Param('searchTerm') searchTerm: string,
  ): Promise<UserDto[]> {
    return await this.userService.findAllBySearchTerm(searchTerm);
  }

  @Post('/friend/add/:id')
  async addUserFriend(
    @Param('id') friendId: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.userService.addUserFriend(friendId, currentUser);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<{ status: number; description: string }> {
    return await this.userService.remove(id);
  }
}
