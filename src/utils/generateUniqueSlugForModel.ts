// /src/utils/generateUniqueSlugForModel.ts
'use strict';

import type { Model } from 'mongoose';
import slugify from 'slugify';

/**
 * Generate a unique slug for any Mongoose model based on a base string.
 * Safe for strict TS and does not depend on a specific model.
 */
export async function generateUniqueSlugForModel(
  ModelCtor: Model<any>,
  base: string
): Promise<string> {
  const baseSlug = slugify((base || '').toString(), { lower: true, strict: true });
  let slug = baseSlug || 'item';
  let count = 1;

  // Ensure uniqueness by incrementing suffix if needed
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await ModelCtor.exists({ slug });
    if (!exists) {
      return slug;
    }
    slug = `${baseSlug}-${count++}`;
  }
}
