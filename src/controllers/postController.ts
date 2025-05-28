// /src/controllers/postController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose'; // <--- Importante para validação segura de ObjectId
import Post from '../models/Post';
import Draft from '../models/Draft';
import { IUser } from '../types/User';
import { logAdminAction } from '../utils/logAdminAction';
import { Types } from 'mongoose';
import { generateUniqueSlug } from '../utils/generateUniqueSlug';

export const getPosts = async (req: Request, res: Response) => {
  try {
    const query: any = {};
    if (req.query.author) {
      query.author = req.query.author;
    }

    const posts = await Post.find(query)
      .populate('categories', 'name slug logo')
      .select('slug translations categories author createdAt updatedAt')
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // --- PATCH: validação de ObjectId para evitar erro 500 em IDs malformados ---
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // --------------------------------------------------------------------------

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching post' });
  }
};

// Multilíngue com fallback
export const getPostBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const lang = (req as any).lang || 'en';

  try {
    const post = await Post.findOne({ slug })
      .populate('categories', 'name slug logo')
      .populate('author', 'name');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const translations = post.translations || {};
    // Fallback para inglês se não existir tradução do idioma pedido
    const translation = translations[lang] || translations['en'];
    if (!translation) {
      return res.status(404).json({ message: 'Translation not found' });
    }

    return res.status(200).json({
      slug: post.slug,
      lang,
      translation, // { title, content, description }
      categories: post.categories,
      author: post.author,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch post' });
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
      slug,
      translations: {
        en: {
          title: draft.title,
          content: draft.content,
          description: draft.description,
        },
        // Outras línguas podem ser adicionadas via updatePost
      },
      author: draft.author,
      categories: draft.categories || [],
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
    const slug = await generateUniqueSlug(req.body.translations?.en?.title || 'post');
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
    const posts = await Post.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('author', 'name')
      .populate('categories', 'name slug logo');

    return res.status(200).json(posts);
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
    return res.status(500).json({ message: 'Search failed', error: msg });
  }
};
