// /src/types/Project.ts
'use strict';

export type ProjectType = 'frontend-ui' | 'ux-figma' | 'full';
export type ProjectSource = 'figma' | 'github' | 'mixed';

export interface ProjectTranslation {
  lang: 'en' | 'pt' | 'de' | 'es';
  title: string;
  excerpt: string;
  slug?: string;
}

export interface ProjectLinks {
  figma?: string;
  figmaEmbedUrl?: string;
  github?: string;
  live?: string;
  blog?: string;
}

export interface ProjectMetaFigma {
  fileKey?: string;
  fileName?: string;
  thumbnailUrl?: string;
  lastModified?: string;
}

export interface ProjectMetaGitHub {
  repo?: string; // "owner/name"
  stars?: number;
  lastCommitAt?: string;
  topics?: string[];
  description?: string;
}

export interface ProjectDTO {
  slug?: string;
  type: ProjectType;
  source: ProjectSource;
  title: string;
  excerpt: string;
  coverImage?: string;
  tags?: string[];
  links?: ProjectLinks;
  translations?: ProjectTranslation[];
  meta?: {
    figma?: ProjectMetaFigma;
    github?: ProjectMetaGitHub;
  };
  isPublic?: boolean;
}
