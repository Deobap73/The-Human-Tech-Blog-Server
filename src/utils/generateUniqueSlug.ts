// The-Human-Tech-Blog-Server/src/utils/generateUniqueSlug.ts

import slugify from 'slugify';
import Post from '../models/Post';

export const generateUniqueSlug = async (title: string): Promise<string> => {
  let baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 1;
  // Ensures the slug is unique, incrementing if necessary
  while (await Post.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }
  return slug;
};
