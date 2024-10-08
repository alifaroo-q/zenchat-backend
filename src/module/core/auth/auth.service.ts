import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../feature/user/user.service';
import { LoginDto, RegisterDto } from './dto';

import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Socket } from 'socket.io';
import { User } from 'src/module/feature/user/entity/user.entity';
import { UserPayload } from 'src/types/user-payload.type';
import { extractJwtToken } from 'src/utils/app/extract-jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const user = (await this.userService.findOneByEmail(
        registerDto.email,
        false,
      )) as User;

      if (user)
        throw new BadRequestException(
          'An error occurred during registration. User with email exists',
        );

      const { password, ...userInfo } = registerDto;
      let hashedPassword: string;

      try {
        hashedPassword = await bcrypt.hash(
          password,
          this.configService.get('app.saltLength'),
        );
      } catch (error) {
        this.logger.error('An error occurred during hashing password', error);
        throw new HttpException(
          'Error hashing password',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newUser = await this.userService.create({
        ...userInfo,
        password: hashedPassword,
      });

      const { id, email } = newUser;

      const accessToken = this.generateAccessToken(id, email);

      return { accessToken, newUser };
    } catch (error) {
      this.logger.error('An error occurred during registration.', error);
      throw new InternalServerErrorException(
        'An error occurred during registration. Please try again later.',
      );
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    try {
      const user = (await this.userService.findOneByEmail(
        email,
        false,
      )) as User;

      if (!user) {
        this.logger.warn(`Invalid email "${email}" or password`);
        throw new UnauthorizedException('Invalid email or password');
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        this.logger.warn(`Invalid email "${email}" or password`);
        throw new UnauthorizedException('Invalid email or password');
      }

      const { id } = user;
      const accessToken = this.generateAccessToken(id, email);

      const currentUser = await this.userService.findOne(user.id);
      return { accessToken, currentUser };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`, error.stack);
      throw new UnauthorizedException('Login failed. Please try again later.');
    }
  }

  authenticateSocket(socket: Socket): UserPayload {
    const token = extractJwtToken(socket);
    return this.jwtService.verify<UserPayload>(token, {
      secret: process.env.JWT_SECRET_KEY,
    });
  }

  private generateAccessToken(id: string, email: string): string {
    const ACCESS_TOKEN_SECRET = this.configService.get('app.jwtSecretKey');
    const EXPIRES_IN = this.configService.get('app.jwtExpiresIn');

    const accessToken = this.jwtService.sign(
      { id, email },
      { secret: ACCESS_TOKEN_SECRET, expiresIn: EXPIRES_IN },
    );
    return accessToken;
  }
}
