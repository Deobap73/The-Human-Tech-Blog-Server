// /src/controllers/automationPostsController.ts
'use strict';

import type { Request, Response } from 'express';
import { isValidObjectId, Types } from 'mongoose';

import Post from '../models/Post';
import Category from '../models/Category';
import Tag from '../models/Tag';

import { markdownToTiptapString } from '../services/markdownToTiptap.service';
import { generateUniqueSlug } from '../utils/generateUniqueSlug';
import type { IUser } from '../types/User';
import type {
  AutomationCreateDraftBody,
  AutomationCreateDraftResponse,
  AutomationTranslationInput,
} from '../types/Make';

function normalizeString(input: unknown): string {
  return typeof input === 'string' ? input.trim() : '';
}

/**
 * Normaliza o campo instagramImage para ser apenas string
 * - Se for objeto, extrai a propriedade 'url'
 * - Se for outro tipo, converte para string
 */
function normalizeInstagramImageString(input: unknown): string {
  if (input === null || input === undefined || input === '') {
    return '';
  }

  if (typeof input === 'string') {
    return input.trim();
  }

  if (typeof input === 'object' && input !== null) {
    // Se for objeto, extrair apenas a URL
    const url = (input as any).url || (input as any).imageUrl || '';
    return url.trim();
  }

  // Qualquer outro tipo (number, boolean, etc.) converter para string
  return String(input).trim();
}

/**
 * Sanitizes a slug into a stable format that matches the project convention.
 * Convention: lowercase and hyphen separated.
 *
 * Rules:
 * - keeps letters and numbers
 * - keeps hyphens
 * - converts spaces and underscores into hyphens
 * - removes diacritics
 * - removes other characters
 * - collapses repeated hyphens
 * - trims hyphens from start and end
 */
function sanitizeSlug(input: string): string {
  const safe = typeof input === 'string' ? input : '';

  const normalized = safe
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

  const cleaned = normalized
    // keep letters, numbers, spaces, underscores, and hyphens
    .replace(/[^a-z0-9\s_-]/g, ' ')
    // convert whitespace and underscores into hyphens
    .replace(/[\s_]+/g, '-')
    // collapse repeated hyphens
    .replace(/-+/g, '-')
    // trim hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  return cleaned;
}

/**
 * Normalizes an input that may arrive as:
 * - "a,b,c"
 * - ["a", "b", "c"]
 * - ["a,b,c"]
 *
 * Always returns an array of sanitized slugs.
 */
function normalizeSlugArray(input: unknown): string[] {
  const rawValues: string[] = [];

  const pushPartsFromString = (value: string): void => {
    const parts = value
      .split(',')
      .map((p) => p.trim())
      .filter((p) => Boolean(p));
    rawValues.push(...parts);
  };

  if (Array.isArray(input)) {
    for (const v of input) {
      if (typeof v !== 'string') continue;
      pushPartsFromString(v);
    }
  } else if (typeof input === 'string') {
    pushPartsFromString(input);
  }

  const cleaned = rawValues.map((v) => sanitizeSlug(v)).filter((v) => Boolean(v));

  return cleaned;
}

function pickLangTranslation(
  translations: Record<string, AutomationTranslationInput> | undefined,
  lang: 'en' | 'pt' | 'de' | 'es',
): AutomationTranslationInput | null {
  if (!translations) return null;
  const t = translations[lang];
  if (!t) return null;

  const title = normalizeString(t.title);
  const description = normalizeString(t.description);
  const content = normalizeString(t.content);

  if (!title || !description || !content) return null;

  return { title, description, content };
}

async function resolveCategoryIdsBySlugs(categorySlugs: string[]): Promise<Types.ObjectId[]> {
  if (!categorySlugs.length) return [];

  const categories = await Category.find({ slug: { $in: categorySlugs } })
    .select('_id slug')
    .lean();

  const map = new Map<string, Types.ObjectId>();
  for (const c of categories) {
    map.set(String((c as any).slug), (c as any)._id as Types.ObjectId);
  }

  const missing = categorySlugs.filter((s) => !map.has(s));
  if (missing.length) {
    throw new Error(`Missing categories: ${missing.join(', ')}`);
  }

  return categorySlugs.map((s) => map.get(s) as Types.ObjectId);
}

/**
 * Search for tags by slug, create any missing ones, and always return an array of IDs
 * in the same order as the input.
 */
async function resolveTagIdsBySlugs(tagSlugs: string[]): Promise<Types.ObjectId[]> {
  if (!tagSlugs.length) return [];

  const normalized = tagSlugs.map((s) => sanitizeSlug(s)).filter((s) => Boolean(s));

  if (!normalized.length) return [];

  const unique = Array.from(new Set(normalized));

  const existing = await Tag.find({ slug: { $in: unique } })
    .select('_id slug')
    .lean();

  const map = new Map<string, Types.ObjectId>();
  for (const t of existing) {
    map.set(String((t as any).slug), (t as any)._id as Types.ObjectId);
  }

  const missing = unique.filter((s) => !map.has(s));

  if (missing.length) {
    const docsToCreate = missing.map((slug) => ({
      slug,
      color: '#cccccc',
      translations: {
        en: { name: slug },
        pt: { name: slug },
        de: { name: slug },
        es: { name: slug },
      },
    }));

    try {
      const created = await Tag.insertMany(docsToCreate, { ordered: false });
      for (const c of created) {
        map.set(String((c as any).slug), (c as any)._id as Types.ObjectId);
      }
    } catch (err: unknown) {
      const createdNow = await Tag.find({ slug: { $in: missing } })
        .select('_id slug')
        .lean();

      for (const t of createdNow) {
        map.set(String((t as any).slug), (t as any)._id as Types.ObjectId);
      }
    }
  }

  const stillMissing = unique.filter((s) => !map.has(s));
  if (stillMissing.length) {
    throw new Error(`Missing tags after create attempt: ${stillMissing.join(', ')}`);
  }

  return normalized.map((s) => map.get(s) as Types.ObjectId);
}

/**
 * POST /posts/automation/drafts
 * Auth: Automation token
 *
 * Creates a draft post from Make using:
 * category slugs
 * tag slugs
 * 4 language translations
 * content markdown converted to TipTap JSON string
 */
export async function createAutomationDraft(req: Request, res: Response): Promise<Response> {
  const user = req.user as IUser;

  try {
    const body = (req.body || {}) as AutomationCreateDraftBody;

    const sheetId = normalizeString(body.sheetId);
    const sourceKey = normalizeString(body.sourceKey);

    const contentKind = body.contentKind === 'TechShort' ? 'TechShort' : 'Post';
    const size =
      body.size === 'short' || body.size === 'medium' || body.size === 'large'
        ? body.size
        : 'short';

    const imageUrl = normalizeString(body.imageUrl) || '';
    const instagramImage = normalizeInstagramImageString(body.instagramImage) || ''; // NOVO CAMPO

    const cta = normalizeString(body.cta) || '';

    const categorySlugs = normalizeSlugArray(body.categorySlugs);
    const tagSlugs = normalizeSlugArray(body.tagSlugs);

    const isAiPrompt = Boolean(body.isAiPrompt);

    if (!sheetId) {
      return res.status(400).json({ ok: false, error: 'Missing sheetId' });
    }

    if (!sourceKey) {
      return res.status(400).json({ ok: false, error: 'Missing sourceKey' });
    }

    if (!categorySlugs.length) {
      return res.status(400).json({ ok: false, error: 'Missing categorySlugs' });
    }

    if (!tagSlugs.length) {
      return res.status(400).json({ ok: false, error: 'Missing tagSlugs' });
    }

    const en = pickLangTranslation(body.translations, 'en');
    const pt = pickLangTranslation(body.translations, 'pt');
    const de = pickLangTranslation(body.translations, 'de');
    const es = pickLangTranslation(body.translations, 'es');

    if (!en || !pt || !de || !es) {
      return res.status(400).json({
        ok: false,
        error: 'Missing translations. Required: en, pt, de, es with title, description, content',
      });
    }

    if (!imageUrl) {
      return res.status(400).json({ ok: false, error: 'Missing imageUrl' });
    }

    if (!user || !isValidObjectId(user._id)) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const existing = await Post.findOne({
      automation: { $exists: true },
      'automation.sourceKey': sourceKey,
    })
      .select('_id slug')
      .lean();

    if (existing) {
      const response: AutomationCreateDraftResponse = {
        ok: true,
        postId: String((existing as any)._id),
        slug: String((existing as any).slug),
      };
      return res.status(200).json(response);
    }

    const categories = await resolveCategoryIdsBySlugs(categorySlugs);
    const tags = await resolveTagIdsBySlugs(tagSlugs);

    const slug = await generateUniqueSlug(en.title);

    // Preparar dados do post
    const postData: any = {
      slug,
      image: imageUrl,
      status: 'draft',
      isQuickPost: contentKind === 'TechShort',
      isAiPrompt,
      translations: {
        en: {
          title: en.title,
          description: en.description,
          content: markdownToTiptapString(en.content),
        },
        pt: {
          title: pt.title,
          description: pt.description,
          content: markdownToTiptapString(pt.content),
        },
        de: {
          title: de.title,
          description: de.description,
          content: markdownToTiptapString(de.content),
        },
        es: {
          title: es.title,
          description: es.description,
          content: markdownToTiptapString(es.content),
        },
      },
      categories,
      tags,
      author: user._id,
      automation: {
        sheetId,
        sourceKey,
        contentKind,
        size,
        cta: cta || undefined,
      },
    };

    // Adicionar instagramImage apenas se não for vazio
    if (instagramImage) {
      postData.instagramImage = instagramImage;
    }

    const created = await Post.create(postData);

    const response: AutomationCreateDraftResponse = {
      ok: true,
      postId: String(created._id),
      slug: created.slug,
    };

    return res.status(201).json(response);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return res.status(500).json({ ok: false, error: msg });
  }
}
