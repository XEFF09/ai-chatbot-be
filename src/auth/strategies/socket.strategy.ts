import { Socket } from 'socket.io';
import { JwtAuthGuard } from '../auth.guard';

export type SocketIOMiddleware = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (): SocketIOMiddleware => {
  return (client, next) => {
    try {
      JwtAuthGuard.validateWsToken(client);
      next();
    } catch (err) {
      next(err as Error);
    }
  };
};
