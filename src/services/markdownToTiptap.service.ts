// ./src/services/markdownToTiptap.service.ts

'use strict';

export type TiptapNode = Record<string, unknown>;

export type TiptapDoc = {
  type: 'doc';
  content: TiptapNode[];
};

function makeTextNode(text: string): TiptapNode {
  return { type: 'text', text };
}

function makeParagraph(text: string): TiptapNode {
  return {
    type: 'paragraph',
    content: [makeTextNode(text)],
  };
}

function makeHeading(level: number, text: string): TiptapNode {
  const safeLevel = level >= 1 && level <= 6 ? level : 2;
  return {
    type: 'heading',
    attrs: { level: safeLevel },
    content: [makeTextNode(text)],
  };
}

function makeBulletList(items: string[]): TiptapNode {
  return {
    type: 'bulletList',
    content: items.map((t) => ({
      type: 'listItem',
      content: [makeParagraph(t)],
    })),
  };
}

function makeOrderedList(items: string[]): TiptapNode {
  return {
    type: 'orderedList',
    attrs: { start: 1 },
    content: items.map((t) => ({
      type: 'listItem',
      content: [makeParagraph(t)],
    })),
  };
}

/**
 * Converts light markdown to TipTap JSON.
 * Rules:
 * Empty line splits blocks
 * Leading # or ## or ### creates headings
 * Leading * or • creates bullet lists
 * Leading 1. 2. 3. creates ordered list
 * Everything else becomes paragraph
 */
export function markdownToTiptap(markdown: string): TiptapDoc {
  const safe = typeof markdown === 'string' ? markdown : '';
  const lines = safe.replace(/\r/g, '').split('\n');

  const blocks: TiptapNode[] = [];
  let buffer: string[] = [];

  const flushParagraph = (): void => {
    const text = buffer.join(' ').trim();
    buffer = [];
    if (!text) return;
    blocks.push(makeParagraph(text));
  };

  let i = 0;

  while (i < lines.length) {
    const raw = lines[i] ?? '';
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      i += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      blocks.push(makeHeading(3, line.slice(4).trim()));
      i += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      blocks.push(makeHeading(2, line.slice(3).trim()));
      i += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      flushParagraph();
      blocks.push(makeHeading(1, line.slice(2).trim()));
      i += 1;
      continue;
    }

    const isBullet = line.startsWith('* ') || line.startsWith('• ');
    if (isBullet) {
      flushParagraph();

      const items: string[] = [];
      while (i < lines.length) {
        const l = (lines[i] ?? '').trim();
        const ok = l.startsWith('* ') || l.startsWith('• ');
        if (!ok) break;
        items.push(l.slice(2).trim());
        i += 1;
      }

      if (items.length) blocks.push(makeBulletList(items));
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+/);
    if (orderedMatch) {
      flushParagraph();

      const items: string[] = [];
      while (i < lines.length) {
        const l = (lines[i] ?? '').trim();
        const m = l.match(/^\d+\.\s+/);
        if (!m) break;
        items.push(l.replace(/^\d+\.\s+/, '').trim());
        i += 1;
      }

      if (items.length) blocks.push(makeOrderedList(items));
      continue;
    }

    buffer.push(line);
    i += 1;
  }

  flushParagraph();

  return { type: 'doc', content: blocks };
}

/**
 * Helper to store TipTap content in Mongo when the schema expects string.
 */
export function markdownToTiptapString(markdown: string): string {
  const doc = markdownToTiptap(markdown);
  return JSON.stringify(doc);
}
