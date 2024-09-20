import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from './room.entity';
import { User } from '../../user/entity/user.entity';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  roomId: string;

  @Column()
  text: string;

  @ManyToOne(() => Room, (roomEntity) => roomEntity.messages)
  room: Room;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn([{ name: 'createdBy', referencedColumnName: 'id' }])
  creator: User;
}
