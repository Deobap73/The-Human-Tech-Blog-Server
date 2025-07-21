// src/services/aiPromptService.ts
import { isValidObjectId } from 'mongoose';
import Post, { IPost } from '../models/Post';
import { generateUniqueSlug } from '../utils/generateUniqueSlug';

export const getAllAiPrompts = async (filters: any = {}): Promise<IPost[]> => {
  const query: any = { isAiPrompt: true };
  if (filters.author) query.author = filters.author;
  return Post.find(query)
    .populate('categories', 'translations slug logo')
    .populate('tags', 'slug translations')
    .populate('author', 'name avatar _id')
    .select('slug image status isAiPrompt translations categories tags author createdAt updatedAt')
    .sort({ createdAt: -1 });
};

export const createAiPromptDirect = async (
  userId: string,
  data: Partial<IPost>
): Promise<IPost> => {
  const slug = await generateUniqueSlug(data.translations?.en?.title || 'ai-prompt');
  const tags = (data.tags || []).filter((id) => isValidObjectId(id));
  const categories = (data.categories || []).filter((id) => isValidObjectId(id));
  const newPrompt = new Post({
    ...data,
    author: userId,
    slug,
    tags,
    categories,
    isAiPrompt: true,
  });
  await newPrompt.save();
  return newPrompt.populate([
    { path: 'author', select: 'name avatar _id' },
    { path: 'categories', select: 'translations slug logo' },
  ]);
};

export const updateAiPromptDirect = async (
  promptId: string,
  userId: string,
  role: string,
  data: Partial<IPost>
): Promise<IPost | null> => {
  const prompt = await Post.findById(promptId);
  if (!prompt) return null;
  if (String(prompt.author) !== String(userId) && role !== 'admin') {
    throw new Error('Unauthorized');
  }
  const tags = (data.tags || []).filter((id) => isValidObjectId(id));
  const categories = (data.categories || []).filter((id) => isValidObjectId(id));
  Object.assign(prompt, { ...data, tags, categories });
  prompt.isAiPrompt = true;
  await prompt.save();
  return prompt.populate([
    { path: 'author', select: 'name avatar _id' },
    { path: 'categories', select: 'translations slug logo' },
  ]);
};
