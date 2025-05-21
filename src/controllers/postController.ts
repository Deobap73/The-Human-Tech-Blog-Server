// ✅ The-Human-Tech-Blog-Server/src/controllers/postController.ts

import { Request, Response } from 'express';
import Post from '../models/Post';
import Draft from '../models/Draft';
import { IUser } from '../types/User';

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, description, content, image, tags, status, draftId } = req.body;
    const authorId = (req.user as IUser)._id;

    const newPost = new Post({
      title,
      description,
      content,
      image,
      tags: tags || [],
      status: status || 'draft',
      author: authorId,
      categories: [],
    });

    await newPost.save();

    if (draftId) {
      await Draft.findOneAndDelete({ _id: draftId, author: authorId });
    }

    return res.status(201).json({ message: 'Post created', post: newPost });
  } catch (error) {
    console.error('[Create Post]', error);
    return res.status(500).json({ message: 'Failed to create post' });
  }
};

export const getPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .select('title image status description slug author categories createdAt views')
      .populate('author', 'name')
      .populate('categories', 'name slug logo')
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name')
      .populate('categories', 'name slug logo');

    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.status(200).json(post);
  } catch (error) {
    console.error('[Get Post]', error);
    return res.status(500).json({ message: 'Failed to fetch post' });
  }
};

export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'name')
      .populate('categories', 'name slug logo');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.status(200).json(post);
  } catch {
    return res.status(500).json({ message: 'Failed to load post' });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Post not found' });
    return res.status(200).json({ message: 'Post updated', post: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update post' });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Post not found' });
    return res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete post' });
  }
};

export const publishDraft = async (req: Request, res: Response) => {
  const draftId = req.params.id;
  const user = req.user as IUser;

  try {
    const draft = await Draft.findOne({ _id: draftId, author: user._id });
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found or not authorized' });
    }

    const newPost = new Post({
      title: draft.title,
      description: draft.description,
      content: draft.content,
      image: draft.image,
      tags: draft.tags,
      status: 'published',
      author: draft.author,
      categories: [],
    });

    await newPost.save();
    await Draft.findByIdAndDelete(draftId);

    return res.status(201).json({ message: 'Draft published successfully', post: newPost });
  } catch (error) {
    console.error('[Publish Draft]', error);
    return res.status(500).json({ message: 'Failed to publish draft' });
  }
};
