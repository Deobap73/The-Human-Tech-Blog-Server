// The-Human-Tech-Blog-Server/src/socket/socket.ts
import { Server as IOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import http from 'http';
import { env } from '../../config/env';
import User from '../..//models/User';

export const setupSocket = (server: http.Server) => {
  const io = new IOServer(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      // @ts-ignore
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`📡 [socket] User connected: ${socket.user?.email}`);

    socket.on('message:create', ({ conversationId, text }) => {
      console.log(`📨 [socket] Message: ${text} to conversation ${conversationId}`);
      // TODO: Save to DB and emit to conversation members
    });

    socket.on('disconnect', () => {
      console.log(`🚪 [socket] User disconnected: ${socket.user?.email}`);
    });
  });
};
