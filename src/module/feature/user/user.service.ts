import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { sanitizeUser } from 'src/utils/app/sanitize-user';
import { Brackets, In, Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    try {
      const user = this.userRepository.create(createUserDto);
      return sanitizeUser(await this.userRepository.save(user));
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findManyByIds(userIds: string[]): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        where: {
          id: In(userIds),
        },
      });

      return users;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve all users with given ids: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve all users with ids',
      );
    }
  }

  async findOne(
    userId: string,
    sanitize: boolean = true,
  ): Promise<UserDto | User> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        this.logger.error(`User with ID "${userId}" not found`);
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }

      return sanitize ? sanitizeUser(user) : user;
    } catch (error) {
      this.logger.error(`Failed to find user: ${error.message}`, error.stack);
      throw new NotFoundException(`Failed to find user with ID "${userId}"`);
    }
  }

  async addFriend(userId: string, friendId: string) {
    try {
      const [user, friend] = await Promise.all([
        this.userRepository.findOne({
          where: { id: userId },
          relations: ['friends'],
        }),
        this.userRepository.findOne({
          where: { id: friendId },
          relations: ['friends'],
        }),
      ]);

      if (!user) {
        this.logger.error(`User with ID "${userId}" not found`);
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }

      if (!friend) {
        this.logger.error(`Friend user with ID "${friendId}" not found`);
        throw new NotFoundException(
          `Friend user with ID "${friendId}" not found`,
        );
      }

      if (user.friends.some((friend) => friend.id === friendId)) {
        this.logger.error(
          `User "${userId}" is already friend with user "${friendId}"`,
        );
        throw new NotFoundException(
          `User "${userId}" is already friend with user "${friendId}"`,
        );
      }

      if (friend.friends.some((friend) => friend.id === userId)) {
        this.logger.error(
          `User "${friendId}" is already friend with user "${userId}"`,
        );
        throw new NotFoundException(
          `User "${friendId}" is already friend with user "${userId}"`,
        );
      }

      user.friends.push(friend);
      friend.friends.push(user);

      await this.userRepository.save([user, friend]);
    } catch (error) {
      this.logger.error(`Failed to find user: ${error.message}`, error.stack);
      throw new NotFoundException(`Failed to find user with ID "${userId}"`);
    }
  }

  async findOneByEmail(
    email: string,
    sanitize: boolean = true,
  ): Promise<UserDto | User> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email,
        },
      });

      return sanitize ? sanitizeUser(user) : user;
    } catch (error) {
      this.logger.error('Failed to find user by email', error.stack);
      throw new InternalServerErrorException(
        'Failed to find user by email',
        error,
      );
    }
  }

  async findAll(): Promise<UserDto[]> {
    try {
      const users = await this.userRepository.find();
      return users.map((user) => sanitizeUser(user));
    } catch (error) {
      this.logger.error(
        `Failed to retrieve all users: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve all users');
    }
  }

  async findAllBySearchTerm(searchTerm: string): Promise<UserDto[]> {
    try {
      const userQuery = this.userRepository.createQueryBuilder('users');
      const sql = await userQuery
        .leftJoinAndSelect('users.friends', 'friend')
        .where('users.firstName ILIKE :searchTerm', { searchTerm })
        .orWhere('users.lastName ILIKE :searchTerm', { searchTerm })
        .andWhere(
          new Brackets((qb) => {
            qb.where(
              'users.id NOT IN (SELECT "friendId" FROM "userFriends" WHERE "userId" = :userId)',
              { userId: 'be79ba4f-2455-4234-b2d2-faa53112ea9f' },
            );
          }),
        )
        .getMany();

      console.log(sql);

      // return users.map((user) => sanitizeUser(user));
      return [] as UserDto[];
    } catch (error) {
      this.logger.error(
        `Failed to retrieve all users: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve all users');
    }
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    try {
      const user = await this.findOne(userId);

      if (!user) {
        this.logger.warn(`User with ID "${userId}" not found`);
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }

      Object.assign(user, updateUserDto);
      return sanitizeUser(await this.userRepository.save(user));
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`, error.stack);

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        `Failed to update user with ID "${userId}"`,
      );
    }
  }

  async remove(
    userId: string,
  ): Promise<{ status: number; description: string }> {
    try {
      const user = await this.findOne(userId);

      if (!user) {
        this.logger.warn(`User with ID "${userId}" not found`);
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }

      await this.userRepository.delete({ id: user.id });

      return {
        status: HttpStatus.OK,
        description: 'The user has been successfully deleted.',
      };
    } catch (error) {
      this.logger.error(`Failed to remove user: ${error.message}`, error.stack);

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        `Failed to remove user with ID "${userId}"`,
      );
    }
  }
}
