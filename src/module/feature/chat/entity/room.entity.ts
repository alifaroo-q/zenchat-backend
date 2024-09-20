import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Message } from './message.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ enum: ['direct', 'group'] })
  type: string;

  @ManyToMany(() => User, (user) => user.rooms)
  @JoinTable({
    name: 'roomParticipantsUser',
    joinColumn: {
      name: 'roomId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  participants: User[];

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
