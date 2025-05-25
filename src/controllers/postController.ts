// The-Human-Tech-Blog-Server/src/controllers/postController.ts

import { Request, Response } from 'express';
import Post from '../models/Post';
import Draft from '../models/Draft';
import { IUser } from '../types/User';
import { logAdminAction } from '../utils/logAdminAction';
import { Types } from 'mongoose';
import { generateUniqueSlug } from '../utils/generateUniqueSlug';

export const getPosts = async (req: Request, res: Response) => {
  try {
    const query: any = {};
    // Novo: permite filtrar por autor
    if (req.query.author) {
      query.author = req.query.author;
    }

    const posts = await Post.find(query)
      .populate('categories', 'name slug logo')
      .select('title description image slug categories status createdAt author')
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching post' });
  }
};

export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching post' });
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

    const slug = await generateUniqueSlug(draft.title);

    const newPost = new Post({
      title: draft.title,
      description: draft.description,
      content: draft.content,
      image: draft.image,
      tags: draft.tags,
      status: 'published',
      author: draft.author,
      categories: [],
      slug,
    });

    await newPost.save();
    await Draft.findByIdAndDelete(draftId);

    await logAdminAction(
      user._id as Types.ObjectId,
      'PUBLISH_DRAFT',
      `Draft ${draftId} published as post ${newPost._id}`
    );

    return res.status(201).json({ message: 'Draft published successfully', post: newPost });
  } catch (error) {
    console.error('[Publish Draft]', error);
    return res.status(500).json({ message: 'Failed to publish draft' });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const user = req.user as IUser;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Author/admin protection
    if (String(post.author) !== String(user._id) && user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not the author or admin' });
    }

    await post.deleteOne();

    await logAdminAction(user._id as Types.ObjectId, 'DELETE_POST', `Deleted post ${postId}`);

    return res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete post' });
  }
};

export const createPost = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  try {
    const slug = await generateUniqueSlug(req.body.title);

    const newPost = new Post({ ...req.body, author: user._id, slug });
    await newPost.save();

    await logAdminAction(user._id as Types.ObjectId, 'CREATE_POST', `Created post ${newPost._id}`);

    return res.status(201).json({ message: 'Post created', post: newPost });
  } catch (error) {
    console.error('[Create Post]', error);
    return res.status(500).json({ message: 'Failed to create post' });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const user = req.user as IUser;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Author/admin protection
    if (String(post.author) !== String(user._id) && user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not the author or admin' });
    }

    Object.assign(post, req.body);
    await post.save();

    await logAdminAction(user._id as Types.ObjectId, 'UPDATE_POST', `Updated post ${postId}`);

    return res.status(200).json({ message: 'Post updated', post });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update post' });
  }
};

export const searchPosts = async (req: Request, res: Response) => {
  const { q = '', page = 1, limit = 10 } = req.query;
  const query = q.toString().trim();

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  try {
    // Pesquisa full-text ou regex para flexibilidade
    const mongoQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    };

    const posts = await Post.find(mongoQuery)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json(posts);
  } catch (error) {
    console.error('[Search Posts]', error);
    return res.status(500).json({ message: 'Search failed' });
  }
};
