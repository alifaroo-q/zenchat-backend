import { UserDto } from 'src/module/feature/user/dto';
import { User } from 'src/module/feature/user/entity/user.entity';

export const sanitizeUser = (user: User): UserDto => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};
