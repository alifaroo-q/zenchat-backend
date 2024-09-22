import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPayload } from 'src/types/user-payload.type';
import { sanitizeUser } from 'src/utils/app/sanitize-user';
import { Like, Repository } from 'typeorm';
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
        this.logger.warn(`User with ID "${userId}" not found`);
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }

      return sanitize ? sanitizeUser(user) : user;
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
      const users = await this.userRepository.find({
        where: [
          {
            email: Like(`%${searchTerm}%`),
          },
          {
            firstName: Like(`%${searchTerm}%`),
          },
          {
            lastName: Like(`%${searchTerm}%`),
          },
        ],
      });

      return users.map((user) => sanitizeUser(user));
    } catch (error) {
      this.logger.error(
        `Failed to retrieve all users: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve all users');
    }
  }

  async addUserFriend(friendId: string, currentUser: UserPayload) {
    try {
      const friend = await this.userRepository.findOneBy({ id: friendId });

      if (!friend)
        throw new NotFoundException(
          'An error occurred during adding friend. User does not exist',
        );

      const user = await this.userRepository.findOne({
        where: { id: currentUser.id },
        relations: ['friends'],
      });

      const isAlreadyFriend = user.friends.some(
        (user) => user.id === friend.id,
      );

      if (isAlreadyFriend)
        throw new BadRequestException(
          'An error occurred while adding friend. Both users are already friends',
        );

      user.friends.push(friend);
      await this.userRepository.save(user);

      return {
        status: HttpStatus.CREATED,
        message: 'User added to friends',
      };
    } catch (error) {
      this.logger.error(`Failed to add friend: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to add friend with ID "${friendId}" to user`,
      );
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
