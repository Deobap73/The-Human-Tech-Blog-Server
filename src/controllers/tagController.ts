// /src/controllers/tagController.ts

import { Request, Response } from 'express';
import Tag from '../models/Tag';
import Post from '../models/Post';

// GET /tags
export const getAllTags = async (_req: Request, res: Response) => {
  try {
    const tags = await Tag.find().lean();
    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tags' });
  }
};

// GET /tags/:slug
export const getTagBySlug = async (req: Request, res: Response) => {
  try {
    const tag = await Tag.findOne({ slug: req.params.slug }).lean();
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    return res.status(200).json(tag);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tag' });
  }
};

// POST /tags
export const createTag = async (req: Request, res: Response) => {
  try {
    const tag = await Tag.create(req.body);
    return res.status(201).json(tag);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error instanceof Error ? error.message : 'Invalid data' });
  }
};

// DELETE /tags/:id
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const tagId = req.params.id;
    const postsUsingTag = await Post.find({ tags: tagId });
    if (postsUsingTag.length > 0) {
      return res.status(400).json({ message: 'Cannot delete: Tag is in use by posts' });
    }
    await Tag.findByIdAndDelete(tagId);
    return res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete tag' });
  }
};

// GET /tags/:slug/posts
export const getPostsByTagSlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const tag = await Tag.findOne({ slug });
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    const posts = await Post.find({ tags: tag._id, status: 'published' })
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    console.error('[getPostsByTagSlug]', error);
    return res.status(500).json({ message: 'Failed to fetch posts for tag' });
  }
};

export const resolveTagIdsBySlugs = async (req: Request, res: Response) => {
  try {
    const input = req.body?.slugs;
    const slugsRaw = Array.isArray(input) ? input : [];

    const slugs = slugsRaw
      .filter((v) => typeof v === 'string')
      .map((v) => v.trim().toLowerCase())
      .filter((v) => v.length > 0);

    if (slugs.length === 0) {
      return res.status(400).json({ ok: false, error: 'slugs array is required' });
    }

    const tags = await Tag.find({ slug: { $in: slugs } })
      .select('_id slug')
      .lean();

    const foundSlugs = new Set(tags.map((t) => t.slug));
    const missingSlugs = slugs.filter((s) => !foundSlugs.has(s));

    const ids = tags.map((t) => String(t._id));

    return res.status(200).json({
      ok: true,
      ids,
      count: ids.length,
      missingSlugs,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ ok: false, error: msg });
  }
};
