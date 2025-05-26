// src/controllers/tagController.ts

import { Request, Response } from 'express';
import Tag, { ITag, TagTranslation } from '../models/Tag';
import Post from '../models/Post';

// Util to get tag translation with fallback
function getTagTranslation(
  translations: ITag['translations'],
  lang: string
): TagTranslation | null {
  if (!translations) return null;
  const t = translations[lang];
  if (t && t.name) return t;
  const fallback = translations['en'];
  return fallback && fallback.name ? fallback : null;
}

// GET /tags
export const getAllTags = async (req: Request, res: Response) => {
  const lang = (req as any).lang || 'en';
  try {
    const tags = await Tag.find();
    const result = tags.map((tag: ITag) => ({
      slug: tag.slug,
      color: tag.color,
      translation: getTagTranslation(tag.translations, lang),
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    }));
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tags' });
  }
};

// GET /tags/:slug
export const getTagBySlug = async (req: Request, res: Response) => {
  const lang = (req as any).lang || 'en';
  try {
    const tag = (await Tag.findOne({ slug: req.params.slug })) as ITag;
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    return res.status(200).json({
      slug: tag.slug,
      color: tag.color,
      translation: getTagTranslation(tag.translations, lang),
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    });
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
