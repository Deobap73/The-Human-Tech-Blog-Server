// ./src/controllers/uploadController.ts
'use strict';

import type { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import { createUploadTicket } from '../models/UploadTicket';
import { uploadImageBuffer } from '../services/cloudinaryService';
import Category from '../models/Category';
import Post from '../models/Post';

type UploadPostCoverBody = {
  isQuickPost?: string;
  isAiPrompt?: string;
  categoryId?: string;
  categorySlug?: string;
};

type UploadPostInstagramBody = {
  postId?: string;
  slug?: string;
};

function parseBoolean(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const v = value.trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

function normalizeFolderName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function mapCategorySlugToFolder(slug: string): string {
  const s = slug.trim().toLowerCase();

  const map: Record<string, string> = {
    'tech-career': 'Tech-Career',
    'agile-projects': 'Agile-Projects',
    'frontend-ux': 'Frontend-Ux',
    'personal-reflections': 'Personal-Reflections',
    'tech-world': 'Tech-World',
  };

  return map[s] ?? 'Tech-World';
}

async function resolveCategorySlug(params: {
  categoryId?: string;
  categorySlug?: string;
}): Promise<{ slug: string | null; reason: string }> {
  if (typeof params.categorySlug === 'string' && params.categorySlug.trim()) {
    return { slug: params.categorySlug.trim(), reason: 'categorySlug:body' };
  }

  const categoryId = params.categoryId;
  if (!categoryId || !isValidObjectId(categoryId)) {
    return { slug: null, reason: 'missing-or-invalid-categoryId' };
  }

  const cat = await Category.findById(categoryId).select('slug').lean<{ slug?: string } | null>();
  const slug = cat?.slug ?? '';
  if (!slug) {
    return { slug: null, reason: 'categoryId:db-no-slug' };
  }

  return { slug, reason: 'categoryId:db' };
}

async function resolveFolder(params: {
  isQuickPost: boolean;
  isAiPrompt: boolean;
  categoryId?: string;
  categorySlug?: string;
}): Promise<{ folderName: string; reason: string; slugUsed: string | null }> {
  if (params.isAiPrompt) {
    return { folderName: 'Prompt', reason: 'isAiPrompt', slugUsed: null };
  }

  if (params.isQuickPost) {
    return { folderName: 'Tech-Shorts', reason: 'isQuickPost', slugUsed: null };
  }

  const { slug, reason } = await resolveCategorySlug({
    categoryId: params.categoryId,
    categorySlug: params.categorySlug,
  });

  if (!slug) {
    return { folderName: '', reason: `missing-category:${reason}`, slugUsed: null };
  }

  return {
    folderName: mapCategorySlugToFolder(slug),
    reason: `category:${slug}:${reason}`,
    slugUsed: slug,
  };
}

function safePublicIdPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function uploadPostCover(req: Request, res: Response): Promise<Response> {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file?.buffer) {
      return res.status(400).json({ success: false, message: 'Missing file "image"' });
    }

    const body = req.body as UploadPostCoverBody;

    const isQuickPost = parseBoolean(body.isQuickPost);
    const isAiPrompt = parseBoolean(body.isAiPrompt);

    const categoryId = typeof body.categoryId === 'string' ? body.categoryId : undefined;
    const categorySlug = typeof body.categorySlug === 'string' ? body.categorySlug : undefined;

    const { folderName, reason, slugUsed } = await resolveFolder({
      isQuickPost,
      isAiPrompt,
      categoryId,
      categorySlug,
    });

    if (!folderName) {
      return res.status(400).json({
        success: false,
        message: 'Category is required for post cover uploads',
        reason,
      });
    }

    const ticket = await createUploadTicket({
      type: 'POST_COVER',
      meta: {
        reason,
        folderName,
        slugUsed,
        categoryId: categoryId ?? null,
        categorySlug: categorySlug ?? null,
        isQuickPost,
        isAiPrompt,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    const safeFolderName = normalizeFolderName(folderName);

    const rootFolder = 'The-Human-Tech-Blog';
    const folder = `${rootFolder}/${safeFolderName}`;

    const publicId = `${safeFolderName}_${ticket.seq}`;
    const displayName = `${safeFolderName}_${ticket.seq}`;

    const uploaded = await uploadImageBuffer({
      buffer: file.buffer,
      folder,
      publicId,
      displayName,
      preset: 'post_cover',
    });

    return res.status(200).json({
      success: true,
      imageUrl: uploaded.url,
      publicId: uploaded.publicId,
      displayName: uploaded.displayName,
      ticketSeq: ticket.seq,
      folder,
      folderName: safeFolderName,
      reason,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ success: false, message });
  }
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

    if (postId && !isValidObjectId(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid postId' });
    }

    const hasBinding = Boolean(postId || slug);

    const post = hasBinding
      ? postId
        ? await Post.findById(postId)
        : await Post.findOne({ slug })
      : null;

    if (hasBinding && !post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const ticket = await createUploadTicket({
      type: 'POST_INSTAGRAM_IMAGE',
      meta: {
        kind: 'POST_INSTAGRAM_IMAGE',
        mode: post ? 'attached' : 'tmp',
        postId: post ? String(post._id) : null,
        slug: post ? post.slug : slug || null,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    const rootFolder = 'The-Human-Tech-Blog';
    const folderName = post ? 'Instagram' : 'Instagram-Tmp';
    const folder = `${rootFolder}/${folderName}`;

    const slugPart = post ? safePublicIdPart(post.slug || 'post') : 'tmp';
    const publicId = `${folderName}_${slugPart}_${ticket.seq}`;
    const displayName = publicId;

    const uploaded = await uploadImageBuffer({
      buffer: file.buffer,
      folder,
      publicId,
      displayName,
      preset: 'instagram_post',
    });

    if (post) {
      post.instagramImage = uploaded.url;
      await post.save();

      return res.status(200).json({
        success: true,
        imageUrl: uploaded.url,
        postId: String(post._id),
        slug: post.slug,
        ticketSeq: ticket.seq,
        mode: 'attached',
      });
    }

    return res.status(200).json({
      success: true,
      imageUrl: uploaded.url,
      ticketSeq: ticket.seq,
      mode: 'tmp',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ success: false, message });
  }
}
