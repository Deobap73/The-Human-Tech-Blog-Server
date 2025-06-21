// /src/controllers/messageController.ts

import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { IUser } from '../types/User';
import { getSocketIO } from '../socket/index';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

// Get all messages from a conversation
export const getMessages = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { conversationId } = req.params;
  try {
    const messages = await Message.find({ conversation: conversationId }).sort('createdAt').lean();

    // Mark as seen
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: user._id }, seen: false },
      { $set: { seen: true } }
    );

    return res.status(200).json(messages);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send message with optional attachment (image/pdf)
export const sendMessage = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { conversationId } = req.params;
  const { text } = req.body;
  let fileUrl: string | undefined;
  let fileType: string | undefined;
  let fileName: string | undefined;

  try {
    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const idStr = typeof user._id === 'string' ? user._id : String(user._id);
    const isParticipant = conv.participants.some((p) => String(p) === idStr);

    if (!isParticipant && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not a participant' });
    }

    // Handle file upload if exists
    if (req.file) {
      fileType = req.file.mimetype;
      fileName = req.file.originalname;
      // Cloudinary for images, reject PDFs for now if no storage
      if (fileType.startsWith('image/')) {
        const cloudinaryRes = await uploadToCloudinary(req.file.buffer, 'chat-attachments');
        fileUrl = cloudinaryRes.secure_url;
      } else if (fileType === 'application/pdf') {
        // Implement Cloudinary PDF upload if allowed, else reject
        const cloudinaryRes = await uploadToCloudinary(req.file.buffer, 'chat-attachments');
        fileUrl = cloudinaryRes.secure_url;
      } else {
        return res.status(400).json({ error: 'Only image or PDF files allowed' });
      }
    }

    const msg = await Message.create({
      conversation: conversationId,
      sender: user._id,
      text,
      fileUrl,
      fileType,
      fileName,
    });

    // Populate sender for frontend
    const populatedMsg = await msg.populate('sender', 'name email avatar role');

    // Emit to Socket.IO
    try {
      const io = getSocketIO();
      io.to(conversationId).emit('chat:newMessage', {
        ...populatedMsg.toObject(),
      });
    } catch (e) {
      console.warn('[sendMessage] Unable to emit message via socket:', e);
    }

    return res.status(201).json(populatedMsg);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
