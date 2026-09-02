import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import logger from '../utils/logger';

let io: Server;

export const initializeWebSocket = (httpServer: HTTPServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: config.frontend.url,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        email: string;
      };

      socket.data.userId = decoded.userId;
      socket.data.email = decoded.email;

      next();
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    logger.info(`Client connected: ${userId}`);

    // Join user's personal room
    socket.join(userId);

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${userId}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for user ${userId}:`, error);
    });
  });

  logger.info('WebSocket server initialized');

  return io;
};

export { io };
