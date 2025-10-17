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
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.error('getProjectBySlugHandler error:', err);
    return res.status(500).json({ message: 'Failed to get project.' });
  }
}

// --- Admin CRUD (sem dependência de auth do projeto; pode-se ligar depois) ---
export async function createProjectHandler(req: Request, res: Response) {
  try {
    const created = await createProject(req.body);
    return res.status(201).json(created);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('createProjectHandler error:', err);
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
    // eslint-disable-next-line no-console
    console.error('updateProjectHandler error:', err);
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
    // eslint-disable-next-line no-console
    console.error('deleteProjectHandler error:', err);
    return res.status(400).json({ message: 'Failed to delete project.' });
  }
}
