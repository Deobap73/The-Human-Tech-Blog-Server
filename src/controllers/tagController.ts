//src/controllers/tagController.ts

import { Request, Response } from 'express';
import Tag from '../models/Tag';
import Post from '../models/Post';

export const getAllTags = async (_req: Request, res: Response) => {
  try {
    const tags = await Tag.find();
    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tags' });
  }
};

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
