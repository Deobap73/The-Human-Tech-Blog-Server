// /src/utils/generateUniqueSlugForModel.ts
'use strict';

/**
 * Generic unique slug generator for any Mongoose model.
 *
 * What it does:
 * 1) Normalizes the input (removes diacritics, symbols → words, trims, lowercases)
 * 2) Uses slugify with strict mode to keep only URL-safe characters
 * 3) Collapses multiple dashes and trims edges
 * 4) Enforces a max length, keeping a clean ending
 * 5) Ensures uniqueness by appending -1, -2, ... if collisions are found
 *
 * Usage:
 *   const slug = await generateUniqueSlugForModel(ProjectModel, title);
 *   // or for a different field:
 *   const slug = await generateUniqueSlugForModel(ArticleModel, title, 'path');
 */

import type { FilterQuery, Model } from 'mongoose';
import slugify from 'slugify';

// --- Configuration (tweak as needed) ---
const MAX_SLUG_LENGTH = 100;

/**
 * Convert an arbitrary string into a clean slug base.
 * - Removes diacritics (e.g., Gestão → Gestao)
 * - Replaces common symbols with words (& → and, @ → at)
 * - Removes apostrophes and similar punctuation
 * - Uses slugify strict mode to keep only [a-z0-9-]
 * - Collapses duplicate dashes and trims edges
 * - Enforces a max length
 */
function toSlugBase(input: string): string {
  // 1) Normalize diacritics
  let s = String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // 2) Symbol-to-word replacements for better SEO readability
  s = s.replace(/&/g, ' and ').replace(/@/g, ' at ');

  // 3) Remove apostrophes/quotes (avoid empty tokens)
  s = s.replace(/[’'`"]/g, '');

  // 4) Slugify to URL-safe (lowercase + strict)
  s = slugify(s, { lower: true, strict: true, trim: true });

  // 5) Collapse multiple dashes and trim edges
  s = s.replace(/-+/g, '-').replace(/^-|-$/g, '');

  // 6) Enforce max length, trimming hyphens at the end if needed
  if (s.length > MAX_SLUG_LENGTH) {
    s = s.slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, '');
  }

  // 7) Fallback if string ends up empty (e.g., only emojis were given)
  if (!s) s = 'item';

  return s;
}

/**
 * Check if a document with the given field value already exists.
 */
async function valueExists<T>(model: Model<T>, fieldName: keyof T & string, value: string) {
  const q: FilterQuery<T> = { [fieldName]: value } as unknown as FilterQuery<T>;
  const doc = await model.findOne(q).select('_id').lean();
  return Boolean(doc);
}

/**
 * Ensure uniqueness by appending -1, -2, ... if collisions are found.
 */
async function ensureUnique<T>(model: Model<T>, fieldName: keyof T & string, baseSlug: string) {
  let slug = baseSlug;
  let suffix = 1;
  while (await valueExists(model, fieldName, slug)) {
    slug = `${baseSlug}-${suffix++}`;
    // If slug grows too long after suffixing, trim gracefully
    if (slug.length > MAX_SLUG_LENGTH) {
      slug = slug.slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, '');
    }
  }
  return slug;
}

export async function generateUniqueSlugForModel<T>(
  model: Model<T>,
  base: string,
  // Note: default as string for TS strict compatibility; cast to keyof T later.
  field: (keyof T & string) | string = 'slug'
): Promise<string> {
  // Defensive cast to work under strict mode while allowing a string default
  const fieldName = field as keyof T & string;

  // Build clean base
  const baseSlug = toSlugBase(base);

  // Ensure uniqueness
  const uniqueSlug = await ensureUnique(model, fieldName, baseSlug);

  return uniqueSlug;
}
