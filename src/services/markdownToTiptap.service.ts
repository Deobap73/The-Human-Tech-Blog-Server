// /src/services/markdownToTiptap.service.ts

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

function makeCodeBlock(language: string, code: string): TiptapNode {
  const lang = typeof language === 'string' ? language.trim() : '';
  const safeLang = lang ? lang : null;

  const attrs: Record<string, unknown> = {};
  if (safeLang) attrs.language = safeLang;

  return {
    type: 'codeBlock',
    attrs,
    content: [makeTextNode(code)],
  };
}

function isFenceStart(line: string): boolean {
  return line.startsWith('```');
}

function readFenceLanguage(line: string): string {
  return line.slice(3).trim();
}

/**
 * Supports markdown headings:
 * - #### Heading (maps to level 4)
 * - ### Heading (level 3)
 * - ## Heading (level 2)
 * - # Heading (level 1)
 */
function readHeading(line: string): { level: number; text: string } | null {
  const m = line.match(/^(#{1,6})\s+(.*)$/);
  if (!m) return null;

  const level = m[1]?.length ?? 0;
  const text = (m[2] ?? '').trim();
  if (!level || !text) return null;

  return { level, text };
}

/**
 * Converts light markdown to TipTap JSON.
 * - Empty line splits blocks
 * - Headings #..###### supported (including ####)
 * - Bullet lists: "* " or "• "
 * - Ordered lists: "1. " etc
 * - Fenced code blocks ```lang ... ``` become codeBlock nodes
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
    const trimmed = raw.trim();

    if (!trimmed) {
      flushParagraph();
      i += 1;
      continue;
    }

    if (isFenceStart(trimmed)) {
      flushParagraph();

      const language = readFenceLanguage(trimmed);
      const codeLines: string[] = [];
      i += 1;

      while (i < lines.length) {
        const currentRaw = lines[i] ?? '';
        const currentTrimmed = currentRaw.trim();

        if (currentTrimmed.startsWith('```')) break;

        codeLines.push(currentRaw);
        i += 1;
      }

      if (i < lines.length && (lines[i] ?? '').trim().startsWith('```')) {
        i += 1;
      }

      const code = codeLines.join('\n').replace(/\s+$/, '');
      blocks.push(makeCodeBlock(language, code));
      continue;
    }

    const heading = readHeading(trimmed);
    if (heading) {
      flushParagraph();
      blocks.push(makeHeading(heading.level, heading.text));
      i += 1;
      continue;
    }

    const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('• ');
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

    const orderedMatch = trimmed.match(/^\d+\.\s+/);
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

    buffer.push(trimmed);
    i += 1;
  }

  flushParagraph();

  return { type: 'doc', content: blocks };
}

export function markdownToTiptapString(markdown: string): string {
  const doc = markdownToTiptap(markdown);
  return JSON.stringify(doc);
}
