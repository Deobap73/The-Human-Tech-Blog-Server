// /src/controllers/projectController.ts
'use strict';

import { Request, Response } from 'express';
import {
  createProject,
  deleteProject,
  getProjectBySlug,
  listProjects,
  updateProject,
} from '../services/project.service';

// Narrow detection for Mongoose ValidationError without importing mongoose here
function isMongooseValidationError(
  err: unknown
): err is { name: string; errors?: Record<string, any> } {
  return !!err && typeof err === 'object' && (err as any).name === 'ValidationError';
}

// Narrow detection for MongoServerError (index issues, duplicates, etc.)
function isMongoServerError(
  err: unknown
): err is { name: string; code?: number; errmsg?: string; message?: string } {
  return !!err && typeof err === 'object' && (err as any).name === 'MongoServerError';
}

export async function listProjectsHandler(req: Request, res: Response) {
  try {
    const { type, tag, q, lang, page, limit, sort } = req.query;
    const data = await listProjects({
      type: typeof type === 'string' ? type : undefined,
      tag: typeof tag === 'string' ? tag : undefined,
      q: typeof q === 'string' ? q : undefined,
      lang: typeof lang === 'string' ? (lang as any) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sort: typeof sort === 'string' ? (sort as any) : 'updatedAt',
      isPublicOnly: true,
    });
    return res.status(200).json(data);
  } catch (err) {
    console.error('listProjectsHandler error:', err);
    return res.status(500).json({ message: 'Failed to list projects.' });
  }
}

export async function getProjectBySlugHandler(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const doc = await getProjectBySlug(slug);
    if (!doc) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    return res.status(200).json(doc);
  } catch (err) {
    console.error('getProjectBySlugHandler error:', err);
    return res.status(500).json({ message: 'Failed to get project.' });
  }
}

// --- Admin CRUD ---
export async function createProjectHandler(req: Request, res: Response) {
  try {
    const created = await createProject(req.body);
    return res.status(201).json(created);
  } catch (err) {
    console.error('createProjectHandler error:', err);

    if (isMongooseValidationError(err) && err.errors) {
      const errors: Record<string, string> = {};
      for (const [field, detail] of Object.entries(err.errors)) {
        const message = (detail as any)?.message || 'Invalid value';
        errors[field] = message;
      }
      return res.status(422).json({
        message: 'Validation failed',
        errors,
      });
    }

    if (isMongoServerError(err)) {
      // code 201 appears when a compound text index includes an array field that's not text
      if (err.code === 201) {
        return res.status(400).json({
          message:
            "Search index misconfiguration: please rebuild the Project text index to include { title: 'text', excerpt: 'text', tags: 'text' }.",
          details: err.errmsg ?? err.message,
        });
      }
      // fallback for other Mongo server errors (duplicates, etc.)
      return res.status(400).json({
        message: 'Database error while creating project.',
        details: err.errmsg ?? err.message,
      });
    }

    return res.status(400).json({ message: 'Failed to create project.' });
  }
}

export async function updateProjectHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await updateProject(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    return res.status(200).json(updated);
  } catch (err) {
    console.error('updateProjectHandler error:', err);

    if (isMongooseValidationError(err) && (err as any).errors) {
      const errors: Record<string, string> = {};
      for (const [field, detail] of Object.entries((err as any).errors)) {
        const message = (detail as any)?.message || 'Invalid value';
        errors[field] = message;
      }
      return res.status(422).json({
        message: 'Validation failed',
        errors,
      });
    }

    return res.status(400).json({ message: 'Failed to update project.' });
  }
}

export async function deleteProjectHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const ok = await deleteProject(id);
    if (!ok) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('deleteProjectHandler error:', err);
    return res.status(400).json({ message: 'Failed to delete project.' });
  }
}
