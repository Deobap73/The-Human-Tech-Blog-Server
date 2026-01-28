// ./src/controllers/uploadController.ts
'use strict';

import type { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import { createUploadTicket } from '../models/UploadTicket';
import { uploadImageBuffer } from '../services/cloudinaryService';
import Post from '../models/Post';

type UploadPostInstagramBody = {
  postId?: string;
  slug?: string;
};

function safePublicIdPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function uploadPostInstagramImage(req: Request, res: Response): Promise<Response> {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file?.buffer) {
      return res.status(400).json({ success: false, message: 'Missing file "image"' });
    }

    const body = req.body as UploadPostInstagramBody;

    const postId = typeof body.postId === 'string' ? body.postId.trim() : '';
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';

    if (!postId && !slug) {
      return res.status(400).json({
        success: false,
        message: 'postId or slug is required',
      });
    }

    if (postId && !isValidObjectId(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid postId' });
    }

    const post = postId ? await Post.findById(postId) : await Post.findOne({ slug });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Important:
    // If your UploadTicket model does not support POST_INSTAGRAM_IMAGE, this will throw and cause 500.
    // In that case, change the "type" to an existing one and keep the real type in meta.kind.
    const ticket = await createUploadTicket({
      type: 'POST_COVER',
      meta: {
        kind: 'POST_INSTAGRAM_IMAGE',
        postId: String(post._id),
        slug: post.slug,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    const rootFolder = 'The-Human-Tech-Blog';
    const folderName = 'Instagram';
    const folder = `${rootFolder}/${folderName}`;

    const slugPart = safePublicIdPart(post.slug || slug || 'post');
    const publicId = `${folderName}_${slugPart}_${ticket.seq}`;
    const displayName = publicId;

    const uploaded = await uploadImageBuffer({
      buffer: file.buffer,
      folder,
      publicId,
      displayName,
      preset: 'instagram_post',
    });

    post.instagramImage = {
      url: uploaded.url,
      publicId: uploaded.publicId,
      displayName: uploaded.displayName,
      folder,
      updatedAt: new Date(),
    };

    await post.save();

    return res.status(200).json({
      success: true,
      imageUrl: uploaded.url,
      publicId: uploaded.publicId,
      displayName: uploaded.displayName,
      ticketSeq: ticket.seq,
      folder,
      folderName,
      postId: String(post._id),
      slug: post.slug,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ success: false, message });
  }
}
