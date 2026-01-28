// ./src/controllers/postController.ts
import { Request, Response } from 'express';
import mongoose, { isValidObjectId } from 'mongoose';
import Post from '../models/Post';
import Draft from '../models/Draft';
import { IUser } from '../types/User';
import { logAdminAction } from '../utils/logAdminAction';
import { Types } from 'mongoose';
import { generateUniqueSlug } from '../utils/generateUniqueSlug';
import { sendMakePublishedWebhook } from '../services/makeWebhook.service';
import type { MakePublishedWebhookPayload } from '../types/Make';

function normalizeStatus(value: unknown): 'draft' | 'published' | 'archived' | '' {
  if (typeof value !== 'string') return '';
  const v = value.trim().toLowerCase();
  if (v === 'draft' || v === 'published' || v === 'archived') return v;
  return '';
}

function buildMakePayload(post: {
  _id: unknown;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  isQuickPost?: boolean;
  isAiPrompt?: boolean;
  updatedAt: Date;
}): MakePublishedWebhookPayload {
  return {
    postId: String(post._id),
    slug: post.slug,
    status: post.status,
    isQuickPost: Boolean(post.isQuickPost),
    isAiPrompt: Boolean(post.isAiPrompt),
    updatedAt: post.updatedAt.toISOString(),
  };
}

async function triggerMakeWebhookIfPublishedTransition(args: {
  prevStatus: unknown;
  nextStatus: unknown;
  post: {
    _id: unknown;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    isQuickPost?: boolean;
    isAiPrompt?: boolean;
    updatedAt: Date;
  };
}): Promise<void> {
  const prev = normalizeStatus(args.prevStatus);
  const next = normalizeStatus(args.nextStatus);

  if (prev === 'published' || next !== 'published') return;

  const payload = buildMakePayload(args.post);

  void sendMakePublishedWebhook(payload).catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[postController] Make webhook failed:', msg);
  });
}

const postSelect =
  'slug image instagramImage status isQuickPost isAiPrompt translations categories tags author createdAt updatedAt';

// Get all posts, optionally filtered by author
export const getPosts = async (req: Request, res: Response) => {
  try {
    const query: any = {};
    if (req.query.author) {
      query.author = req.query.author;
    }
    if (req.query.quick === 'true') {
      query.isQuickPost = true;
    }

    const posts = await Post.find(query)
      .populate('categories', 'translations slug logo')
      .populate('tags', 'slug translations')
      .populate('author', 'name avatar _id')
      .select(postSelect)
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// Get post by ObjectId
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = await Post.findById(id)
      .populate('categories', 'translations slug logo')
      .populate('tags', 'slug translations')
      .populate('author', 'name avatar _id')
      .select(postSelect);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching post' });
  }
};

// Get post by slug (multilingual with fallback)
export const getPostBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const post = await Post.findOne({ slug })
      .populate('categories', 'translations slug logo')
      .populate('tags', 'slug translations')
      .populate('author', 'name avatar _id')
      .select(postSelect);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch post' });
  }
};

// Publish a draft as a post
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
      status: 'published',
      translations: {
        en: {
          title: draft.title,
          content: draft.content,
          description: draft.description,
        },
      },
      author: draft.author,
      categories: draft.categories || [],
    });

    await newPost.save();
    await Draft.findByIdAndDelete(draftId);

    await logAdminAction(
      user._id as Types.ObjectId,
      'PUBLISH_DRAFT',
      `Draft ${draftId} published as post ${newPost._id}`,
    );

    await newPost.populate('author', 'name avatar _id');
    await newPost.populate('categories', 'translations slug logo');

    await triggerMakeWebhookIfPublishedTransition({
      prevStatus: 'draft',
      nextStatus: newPost.status,
      post: {
        _id: newPost._id,
        slug: newPost.slug,
        status: newPost.status,
        isQuickPost: Boolean(newPost.isQuickPost),
        isAiPrompt: Boolean(newPost.isAiPrompt),
        updatedAt: newPost.updatedAt,
      },
    });

    return res.status(201).json({ message: 'Draft published successfully', post: newPost });
  } catch (error) {
    console.error('[Publish Draft]', error);
    return res.status(500).json({ message: 'Failed to publish draft' });
  }
};

// Delete a post (admin or author)
export const deletePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const user = req.user as IUser;

  try {
    const post = await Post.findById(postId)
      .populate('categories', 'translations slug logo')
      .populate('author', 'name avatar _id');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (String(post.author._id) !== String(user._id) && user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not the author or admin' });
    }

    await post.deleteOne();
    await logAdminAction(user._id as Types.ObjectId, 'DELETE_POST', `Deleted post ${postId}`);

    return res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete post' });
  }
};

// Create a new post
export const createPost = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  try {
    let tags = Array.isArray(req.body.tags) ? req.body.tags : [];
    let categories = Array.isArray(req.body.categories) ? req.body.categories : [];

    tags = tags.filter((id: any) => isValidObjectId(id));
    categories = categories.filter((id: any) => isValidObjectId(id));

    const slug = await generateUniqueSlug(req.body.translations?.en?.title || 'post');

    const prevStatus: 'draft' = 'draft';

    const newPost = new Post({
      ...req.body,
      author: user._id,
      slug,
      tags,
      categories,
    });

    await newPost.save();

    await logAdminAction(user._id as Types.ObjectId, 'CREATE_POST', `Created post ${newPost._id}`);

    await newPost.populate('author', 'name avatar _id');
    await newPost.populate('categories', 'translations slug logo');

    await triggerMakeWebhookIfPublishedTransition({
      prevStatus,
      nextStatus: newPost.status,
      post: {
        _id: newPost._id,
        slug: newPost.slug,
        status: newPost.status,
        isQuickPost: Boolean(newPost.isQuickPost),
        isAiPrompt: Boolean(newPost.isAiPrompt),
        updatedAt: newPost.updatedAt,
      },
    });

    return res.status(201).json({ message: 'Post created', post: newPost });
  } catch (error) {
    console.error('[Create Post]', error);
    return res.status(500).json({ message: 'Failed to create post' });
  }
};

// Update an existing post
export const updatePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const user = req.user as IUser;

  try {
    const post = await Post.findById(postId)
      .populate('categories', 'translations slug logo')
      .populate('author', 'name avatar _id');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (String(post.author._id) !== String(user._id) && user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not the author or admin' });
    }

    const prevStatus = post.status;

    let tags = Array.isArray(req.body.tags) ? req.body.tags : [];
    let categories = Array.isArray(req.body.categories) ? req.body.categories : [];
    tags = tags.filter((id: any) => isValidObjectId(id));
    categories = categories.filter((id: any) => isValidObjectId(id));

    Object.assign(post, { ...req.body, tags, categories });
    await post.save();

    await logAdminAction(user._id as Types.ObjectId, 'UPDATE_POST', `Updated post ${postId}`);

    await post.populate('author', 'name avatar _id');
    await post.populate('categories', 'translations slug logo');

    await triggerMakeWebhookIfPublishedTransition({
      prevStatus,
      nextStatus: post.status,
      post: {
        _id: post._id,
        slug: post.slug,
        status: post.status,
        isQuickPost: Boolean(post.isQuickPost),
        isAiPrompt: Boolean(post.isAiPrompt),
        updatedAt: post.updatedAt,
      },
    });

    return res.status(200).json({ message: 'Post updated', post });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update post' });
  }
};

// Search posts by text
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
      .populate('author', 'name avatar _id')
      .populate('categories', 'translations slug logo')
      .select(postSelect);

    return res.status(200).json(posts);
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
    return res.status(500).json({ message: 'Search failed', error: msg });
  }
};
