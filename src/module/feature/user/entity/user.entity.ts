import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Message } from '../../chat/entity/message.entity';
import { Room } from '../../chat/entity/room.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ManyToMany(() => Room, (room) => room.participants)
  rooms: Room[];

  @OneToMany(() => Message, (message) => message.creator)
  messages: Message[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'userFriends',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'friendId',
      referencedColumnName: 'id',
    },
  })
  friends: User[];
}
