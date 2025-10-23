// /src/models/Project.ts
'use strict';

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  ProjectLinks,
  ProjectMetaFigma,
  ProjectMetaGitHub,
  ProjectTranslation,
  ProjectType,
  ProjectSource,
} from '../types/Project';

export interface ProjectDoc extends Document {
  slug: string;
  type: ProjectType;
  source: ProjectSource;
  title: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  links: ProjectLinks;
  translations: ProjectTranslation[];
  meta: {
    figma?: ProjectMetaFigma;
    github?: ProjectMetaGitHub;
  };
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TranslationSchema = new Schema<ProjectTranslation>(
  {
    lang: { type: String, enum: ['en', 'pt', 'de', 'es'], required: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    slug: { type: String },
  },
  { _id: false }
);

const ProjectSchema = new Schema<ProjectDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['frontend-ui', 'ux-figma', 'full'], required: true, index: true },
    source: { type: String, enum: ['figma', 'github', 'mixed'], required: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    coverImage: { type: String },
    tags: { type: [String], default: [] },
    links: {
      figma: String,
      figmaEmbedUrl: String,
      github: String,
      live: String,
      blog: String,
    },
    translations: { type: [TranslationSchema], default: [] },
    meta: {
      figma: {
        fileKey: String,
        fileName: String,
        thumbnailUrl: String,
        lastModified: String,
      },
      github: {
        repo: String,
        stars: Number,
        lastCommitAt: String,
        topics: [String],
        description: String,
      },
    },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Text search index:
 * - Single text index including title, excerpt, and tags (array<string> is allowed in text index).
 * - Named for easier migrations.
 */
ProjectSchema.index(
  { title: 'text', excerpt: 'text', tags: 'text' },
  { name: 'Project_text_search' }
);

export const Project: Model<ProjectDoc> =
  mongoose.models.Project || mongoose.model<ProjectDoc>('Project', ProjectSchema);
