// The-Human-Tech-Blog-Server/src/socket/handlers/notificationHandler.ts
import { Server, Socket } from 'socket.io';
import Notification from '../../models/Notification';

export const registerNotificationHandlers = (io: Server, socket: Socket) => {
  // Join user room
  const userId = socket.data.user?._id?.toString();
  if (userId) socket.join(`user:${userId}`);

  // Listen for events to notify (exemplo: notificar sobre novo comentário)
  socket.on('notify', async (data) => {
    const { userId, type, message, extraData } = data;
    // Cria notificação no banco
    const notif = await Notification.create({
      user: userId,
      type,
      message,
      data: extraData,
      isRead: false,
    });
    // Emite para o frontend
    io.to(`user:${userId}`).emit('notification:new', notif);
  });
};
