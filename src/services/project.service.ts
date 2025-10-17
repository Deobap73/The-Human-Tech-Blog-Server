// /src/services/project.service.ts
'use strict';

import type { FilterQuery, SortOrder } from 'mongoose';
import { Project, ProjectDoc } from '../models/Project';
import type { ProjectDTO } from '../types/Project';
// NOTE: use the generic helper that works with any model (no breaking change to your existing Post helper)
import { generateUniqueSlugForModel } from 'src/utils/generateUniqueSlugForModel';

export interface ListParams {
  type?: string;
  tag?: string;
  q?: string;
  lang?: 'en' | 'pt' | 'de' | 'es';
  page?: number;
  limit?: number;
  sort?: 'updatedAt' | 'createdAt';
  isPublicOnly?: boolean;
}

/**
 * Build Mongo query from list params.
 */
function buildQuery(params: ListParams): FilterQuery<ProjectDoc> {
  const query: FilterQuery<ProjectDoc> = {};
  if (params.type) query.type = params.type;
  if (params.tag) query.tags = params.tag;
  if (params.isPublicOnly !== false) query.isPublic = true;
  if (params.q) {
    query.$or = [
      { title: { $regex: params.q, $options: 'i' } },
      { excerpt: { $regex: params.q, $options: 'i' } },
      { tags: { $regex: params.q, $options: 'i' } },
    ];
  }
  return query;
}

export async function listProjects(params: ListParams) {
  try {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.max(1, Math.min(100, Number(params.limit || 12)));
    const skip = (page - 1) * limit;

    // Ensure type-safety for Mongoose .sort(...)
    const sortBy: Record<string, SortOrder> =
      params.sort === 'createdAt' ? { createdAt: -1 as SortOrder } : { updatedAt: -1 as SortOrder };

    const query = buildQuery(params);
    const [items, total] = await Promise.all([
      Project.find(query).sort(sortBy).skip(skip).limit(limit).lean(),
      Project.countDocuments(query),
    ]);

    return {
      page,
      limit,
      total,
      items,
    };
  } catch (err) {
    throw err;
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const doc = await Project.findOne({ slug, isPublic: true }).lean();
    return doc;
  } catch (err) {
    throw err;
  }
}

export async function createProject(payload: ProjectDTO) {
  try {
    const baseSlug = payload.slug || payload.title;
    const slug = await generateUniqueSlugForModel(Project, baseSlug);
    const doc = await Project.create({
      ...payload,
      slug,
      isPublic: payload.isPublic !== false,
    });
    return doc.toObject();
  } catch (err) {
    throw err;
  }
}

export async function updateProject(id: string, payload: Partial<ProjectDTO>) {
  try {
    const update: Partial<ProjectDTO> & { slug?: string } = { ...payload };
    if (payload.title && !payload.slug) {
      update.slug = await generateUniqueSlugForModel(Project, payload.title);
    }
    const doc = await Project.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();
    return doc;
  } catch (err) {
    throw err;
  }
}

export async function deleteProject(id: string) {
  try {
    const res = await Project.findByIdAndDelete(id).lean();
    return res !== null;
  } catch (err) {
    throw err;
  }
}
