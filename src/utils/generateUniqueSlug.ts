// /src/utils/generateUniqueSlug.ts
'use strict';

import slugify from 'slugify';
import Post from '../models/Post';

/**
 * Generate a unique slug for the Post model from a title.
 * NOTE: Kept for backward-compat with Post flows.
 */
export const generateUniqueSlug = async (title: string): Promise<string> => {
  const base = (title || '').toString();
  let baseSlug = slugify(base, { lower: true, strict: true });
  if (!baseSlug) baseSlug = 'post';

  let slug = baseSlug;
  let count = 1;

  // Ensures the slug is unique, incrementing if necessary
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await Post.findOne({ slug }).lean();
    if (!exists) {
      return slug;
    }
    slug = `${baseSlug}-${count++}`;
  }
};
