// The-Human-Tech-Blog-Server/src/controllers/postController.ts

import { Request, Response } from 'express';
import { IUser } from '../models/User';
import Post from '../models/Post';

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, description, content, image, tags, status } = req.body;

    const newPost = new Post({
      title,
      description,
      content,
      image,
      tags: tags || [],
      status: status || 'draft',
      author: (req.user as IUser)._id,
      categories: [],
    });

    await newPost.save();
    return res.status(201).json({
      message: 'Post created',
      post: newPost,
    });
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
