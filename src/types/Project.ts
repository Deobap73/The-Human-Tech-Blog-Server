// /src/types/Project.ts
'use strict';

export type ProjectType = 'frontend-ui' | 'ux-figma' | 'full';
export type ProjectSource = 'figma' | 'github' | 'mixed';

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
  repo?: string;
  stars?: number;
  lastCommitAt?: string;
  topics?: string[];
  description?: string;
}

/**
 * Internationalized fields per language.
 * Projects currently use an array based translation structure.
 */
export interface ProjectTranslation {
  lang: 'en' | 'pt' | 'de' | 'es';
  title: string;
  excerpt: string;
  description?: string;
  slug?: string;
}

/**
 * DTO accepted by the controller and service to create or update Project docs.
 */
export interface ProjectDTO {
  slug?: string;
  type: ProjectType;
  source: ProjectSource;
  title: string;
  excerpt: string;
  description?: string;
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
