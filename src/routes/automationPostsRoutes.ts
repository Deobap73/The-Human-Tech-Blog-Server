// src/routes/automationPostsRoutes.ts

import express from 'express';
import type { Request, Response } from 'express';

// ajusta para o teu model real
import Post from '../models/Post';

const router = express.Router();

type AutomationPostBody = {
  sheetId: string;
  contentKind: 'Post' | 'TechShort';
  size: 'short' | 'medium' | 'large';
  title: string;
  bullets?: string;
  categorySlug: string;
  tagSlugs?: string[];
  imageUrl?: string;
  cta?: string;
  lang: 'en';
  publishDate?: string;
  aiText: string;
};

function getEnvOrThrow(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing env ${name}`);
  return v.trim();
}

function assertSecret(req: Request): void {
  const expected = getEnvOrThrow('MAKE_AUTOMATION_SECRET');
  const got = (req.header('x_make_secret') || '').trim();
  if (!got || got !== expected) {
    const err = new Error('Unauthorized');
    (err as any).statusCode = 401;
    throw err;
  }
}

function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, '_');
  return s || `post_${Date.now()}`;
}

type TiptapDoc = {
  type: 'doc';
  content: Array<any>;
};

function textToTiptap(markdown: string): TiptapDoc {
  const lines = markdown.replace(/\r/g, '').split('\n');

  const blocks: any[] = [];
  let buffer: string[] = [];

  const flushParagraph = () => {
    const text = buffer.join(' ').trim();
    buffer = [];
    if (!text) return;
    blocks.push({
      type: 'paragraph',
      content: [{ type: 'text', text }],
    });
  };

  const pushHeading = (level: number, text: string) => {
    blocks.push({
      type: 'heading',
      attrs: { level },
      content: [{ type: 'text', text: text.trim() }],
    });
  };

  const pushBulletList = (items: string[]) => {
    blocks.push({
      type: 'bulletList',
      content: items.map((t) => ({
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: t.trim() }],
          },
        ],
      })),
    });
  };

  const pushOrderedList = (items: string[]) => {
    blocks.push({
      type: 'orderedList',
      attrs: { start: 1 },
      content: items.map((t) => ({
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: t.trim() }],
          },
        ],
      })),
    });
  };

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      i += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      pushHeading(3, line.slice(4));
      i += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      pushHeading(2, line.slice(3));
      i += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      flushParagraph();
      pushHeading(1, line.slice(2));
      i += 1;
      continue;
    }

    const bulletLike = line.startsWith('* ') || line.startsWith('• ');
    if (bulletLike) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        const ok = l.startsWith('* ') || l.startsWith('• ');
        if (!ok) break;
        items.push(l.slice(2));
        i += 1;
      }
      pushBulletList(items);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+/);
    if (orderedMatch) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        const m = l.match(/^\d+\.\s+/);
        if (!m) break;
        items.push(l.replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      pushOrderedList(items);
      continue;
    }

    buffer.push(line);
    i += 1;
  }

  flushParagraph();

  return { type: 'doc', content: blocks };
}

router.post('/automation/posts', async (req: Request, res: Response) => {
  try {
    assertSecret(req);

    const body = req.body as AutomationPostBody;

    if (!body || !body.sheetId || !body.title || !body.categorySlug || !body.aiText) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const slug = slugify(body.title);

    const contentDoc = textToTiptap(body.aiText);

    const now = new Date();

    const created = await Post.create({
      slug,
      status: 'DRAFT',
      isQuickPost: body.contentKind === 'TechShort',
      isAiPrompt: false,

      coverImageUrl: body.imageUrl || null,

      categorySlug: body.categorySlug,
      tagSlugs: Array.isArray(body.tagSlugs) ? body.tagSlugs : [],

      createdAt: now,
      updatedAt: now,

      translations: [
        {
          lang: body.lang || 'en',
          title: body.title,
          description: body.bullets || null,
          content: contentDoc,
        },
      ],

      automation: {
        sheetId: body.sheetId,
        contentKind: body.contentKind,
        size: body.size,
        publishDate: body.publishDate || null,
      },
    });

    const url = `https://thehumantechblog.com/posts/${created.slug}`;

    return res.json({
      ok: true,
      postId: String(created._id),
      slug: created.slug,
      url,
    });
  } catch (err: any) {
    const code = err?.statusCode || 500;
    return res.status(code).json({
      ok: false,
      error: err?.message || 'Server error',
    });
  }
});

export default router;
