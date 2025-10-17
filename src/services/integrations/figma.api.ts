// /src/services/integrations/figma.api.ts
'use strict';

import fetch from 'node-fetch';

export interface FigmaFileResponse {
  name?: string;
  lastModified?: string;
  thumbnailUrl?: string;
}

export async function getFigmaFileMeta(
  fileKey: string,
  token: string
): Promise<FigmaFileResponse | null> {
  try {
    const url = `https://api.figma.com/v1/files/${encodeURIComponent(fileKey)}`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Figma-Token': token,
      },
    });
    if (!resp.ok) {
      return null;
    }
    const json = (await resp.json()) as any;
    const data: FigmaFileResponse = {
      name: json?.name,
      lastModified: json?.lastModified,
      thumbnailUrl: json?.thumbnailUrl,
    };
    return data;
  } catch {
    return null;
  }
}

export function buildFigmaEmbedUrl(publicFileUrl: string): string {
  // public url -> embed url
  const encoded = encodeURIComponent(publicFileUrl);
  return `https://www.figma.com/embed?embed_host=share&url=${encoded}`;
}
