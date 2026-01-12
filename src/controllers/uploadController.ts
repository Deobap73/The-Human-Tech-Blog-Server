// ./src/controllers/uploadController.ts

'use strict';

import type { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { createUploadTicket } from '../models/UploadTicket';
import { uploadImageBuffer } from '../services/cloudinaryService';
import Category from '../models/Category';

type UploadPostCoverBody = {
  isQuickPost?: string;
  isAiPrompt?: string;
  categoryId?: string;
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
    'tech-tools': 'Tech-Tools',
  };

  return map[s] ?? 'Tech-Tools';
}

async function resolveFolder(params: {
  isQuickPost: boolean;
  isAiPrompt: boolean;
  categoryId?: string;
}): Promise<{ folderName: string; reason: string }> {
  if (params.isAiPrompt) {
    return { folderName: 'Prompt', reason: 'isAiPrompt' };
  }

  if (params.isQuickPost) {
    return { folderName: 'Tech-Shorts', reason: 'isQuickPost' };
  }

  const categoryId = params.categoryId;
  if (!categoryId || !isValidObjectId(categoryId)) {
    return { folderName: 'Tech-Tools', reason: 'fallback:no-category' };
  }

  const cat = await Category.findById(categoryId).select('slug').lean<{ slug?: string } | null>();
  const slug = cat?.slug ?? '';
  if (!slug) {
    return { folderName: 'Tech-Tools', reason: 'fallback:category-no-slug' };
  }

  return { folderName: mapCategorySlugToFolder(slug), reason: `category:${slug}` };
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

    const { folderName, reason } = await resolveFolder({ isQuickPost, isAiPrompt, categoryId });

    const ticket = await createUploadTicket({
      type: 'POST_COVER',
      meta: {
        reason,
        folderName,
        categoryId: categoryId ?? null,
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
