// /src/services/post.service.ts
import Post from '../models/Post';
import { IPost } from '../models/Post';
import { generateUniqueSlug } from '../utils/generateUniqueSlug';
import { isValidObjectId } from 'mongoose';

export const getAllPosts = async (filters: any = {}) => {
  const query: any = {};

  if (filters.author) {
    query.author = filters.author;
  }

  if (filters.quick === 'true') {
    query.isQuickPost = true;
  }

  return Post.find(query)
    .populate('categories', 'translations slug logo')
    .populate('tags', 'slug translations')
    .populate('author', 'name avatar _id')
    .select(
      'slug image instagramImage status isQuickPost translations categories tags author createdAt updatedAt',
    ) // Adicionado instagramImage
    .sort({ createdAt: -1 });
};

export const createPostDirect = async (userId: string, data: Partial<IPost>): Promise<IPost> => {
  const slug = await generateUniqueSlug(data.translations?.en?.title || 'post');

  const tags = (data.tags || []).filter((id) => isValidObjectId(id));
  const categories = (data.categories || []).filter((id) => isValidObjectId(id));

  // Garantir que instagramImage seja apenas string
  const cleanData = {
    ...data,
    // Se instagramImage for objeto, extrair apenas a URL
    instagramImage:
      typeof data.instagramImage === 'object' && data.instagramImage !== null
        ? (data.instagramImage as any).url || ''
        : data.instagramImage || '',
  };

  const newPost = new Post({
    ...cleanData,
    author: userId,
    slug,
    tags,
    categories,
  });

  await newPost.save();
  return newPost.populate([
    { path: 'author', select: 'name avatar _id' },
    { path: 'categories', select: 'translations slug logo' },
  ]);
};

export const updatePostDirect = async (
  postId: string,
  userId: string,
  role: string,
  data: Partial<IPost>,
): Promise<IPost | null> => {
  const post = await Post.findById(postId);
  if (!post) return null;

  if (String(post.author) !== String(userId) && role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const tags = (data.tags || []).filter((id) => isValidObjectId(id));
  const categories = (data.categories || []).filter((id) => isValidObjectId(id));

  // Garantir que instagramImage seja apenas string
  const cleanInstagramImage =
    typeof data.instagramImage === 'object' && data.instagramImage !== null
      ? (data.instagramImage as any).url || ''
      : data.instagramImage || '';

  Object.assign(post, {
    ...data,
    tags,
    categories,
    instagramImage: cleanInstagramImage,
  });

  await post.save();

  return post.populate([
    { path: 'author', select: 'name avatar _id' },
    { path: 'categories', select: 'translations slug logo' },
  ]);
};
