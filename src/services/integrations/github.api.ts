// /src/services/integrations/github.api.ts
'use strict';

import fetch from 'node-fetch';

export interface GitHubRepoMeta {
  description?: string;
  stargazers_count?: number;
  topics?: string[];
  pushed_at?: string;
}

export async function getRepoMeta(repo: string, token: string): Promise<GitHubRepoMeta | null> {
  try {
    const url = `https://api.github.com/repos/${repo}`;
    const resp = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!resp.ok) {
      return null;
    }
    const json = (await resp.json()) as any;
    // Topics require a separate header in old API; new accepts default for many orgs.
    return {
      description: json?.description,
      stargazers_count: json?.stargazers_count,
      topics: Array.isArray(json?.topics) ? json.topics : [],
      pushed_at: json?.pushed_at,
    };
  } catch {
    return null;
  }
}
