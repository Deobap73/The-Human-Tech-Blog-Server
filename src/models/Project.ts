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
  description?: string;
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
    description: { type: String },
    slug: { type: String },
  },
  { _id: false },
);

const ProjectSchema = new Schema<ProjectDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },

    type: {
      type: String,
      enum: ['frontend-ui', 'ux-figma', 'full', 'automation'],
      required: true,
      index: true,
    },

    source: {
      type: String,
      enum: ['figma', 'github', 'mixed'],
      required: true,
    },

    title: { type: String, required: true },

    excerpt: { type: String, required: true },

    description: { type: String },

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
  { timestamps: true },
);

/**
 * Text search index:
 * Includes title, excerpt, description, and tags.
 */
ProjectSchema.index(
  {
    title: 'text',
    excerpt: 'text',
    description: 'text',
    tags: 'text',
  },
  { name: 'Project_text_search' },
);

export const Project: Model<ProjectDoc> =
  mongoose.models.Project || mongoose.model<ProjectDoc>('Project', ProjectSchema);
