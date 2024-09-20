import { UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';

export const extractJwtToken = (socket: Socket): string => {
  const authHeader = socket.handshake.headers.authorization;
  if (!authHeader)
    throw new UnauthorizedException('No authorization header found');

  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token)
    throw new UnauthorizedException('Invalid or missing token');

  return token;
};
