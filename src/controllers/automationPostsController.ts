// ./src/controllers/automationPostsController.ts

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

function normalizeSlugArray(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((v) => (typeof v === 'string' ? v.trim() : '')).filter((v) => Boolean(v));
  }

  if (typeof input === 'string') {
    return input
      .split(',')
      .map((v) => v.trim())
      .filter((v) => Boolean(v));
  }

  return [];
}

function normalizeString(input: unknown): string {
  return typeof input === 'string' ? input.trim() : '';
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

// Search for tags by slug, create any missing ones, and always return an array of IDs in the same order as the input.

async function resolveTagIdsBySlugs(tagSlugs: string[]): Promise<Types.ObjectId[]> {
  if (!tagSlugs.length) return [];

  const normalized = tagSlugs
    .map((s) => (typeof s === 'string' ? s.trim().toLowerCase() : ''))
    .filter((s) => Boolean(s));

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
    } catch (err: any) {
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
 * Role: admin or editor
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

    const created = await Post.create({
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
    });

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
