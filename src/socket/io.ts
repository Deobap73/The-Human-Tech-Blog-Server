// The-Human-Tech-Blog-Server/src/socket/io.ts
import { Server } from 'socket.io';

let io: Server;

export const initSocketIO = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });
  return io;
};

export const getSocketIO = () => io;
