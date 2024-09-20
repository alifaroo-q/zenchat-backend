import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { RoomTypeEnum } from 'src/enum/room-type.enum';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(RoomTypeEnum)
  type: string;

  @IsArray()
  @IsString({ each: true })
  @IsUUID(4, { each: true, message: 'Each participant must be a valid UUID' })
  participants: string[];
}
