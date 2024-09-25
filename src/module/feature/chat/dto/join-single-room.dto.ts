import { IsNotEmpty, IsString } from 'class-validator';

export class JoinSignleRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
