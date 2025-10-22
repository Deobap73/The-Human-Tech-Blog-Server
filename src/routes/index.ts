// /src/routes/index.ts
import { Router } from 'express';

import csrfRouter from './csrf';
import setupRoutes from './setupRoutes';
import authRoutes from './authRoutes';
import categoryRoutes from './categoryRoutes';
import contactRoutes from './contact';
import postRoutes from './postRoutes';
import aiPromptRoutes from './aiPromptRoutes';
import commentRoutes from './commentRoutes';
import reactionRoutes from './reactionRoutes';
import bookmarkRoutes from './bookmarkRoutes';
import twofaRoutes from './twofaRoutes';
import conversationRoutes from './conversationRoutes';
import messageRoutes from './messageRoutes';
import notificationRoutes from './notificationRoutes';
import adminSettingsRoutes from './adminSettingsRoutes';
import userAdminRoutes from './userAdminRoutes';
import draftRoutes from './draftRoutes';
import newsletterRoutes from './newsletterRoutes';
import userRoutes from './userRoutes';
import tagRoutes from './tagRoutes';
import commentModerationRoutes from './commentModerationRoutes';
import analyticsRoutes from './analyticsRoutes';
import sponsorRoutes from './sponsor.routes';
import sitemapRoute from './sitemapRoute';

// Projects (public + sync)
import projectRoutes from './projectRoutes';
import projectSyncRoutes from './projectSyncRoutes';

// NEW: admin-only sync routes (manual trigger)
import projectSyncAdminRoutes from './projectSyncAdminRoutes';

export function buildRootRouter() {
  const root = Router();

  // --- API namespace ---
  const api = Router();

  // Public/general routes
  api.use('/', csrfRouter);
  api.use('/setup', setupRoutes);
  api.use('/auth', authRoutes);
  api.use('/categories', categoryRoutes);
  api.use('/contact', contactRoutes);
  api.use('/posts', postRoutes);
  api.use('/ai-prompts', aiPromptRoutes);
  api.use('/comments', commentRoutes);
  api.use('/moderation/comments', commentModerationRoutes);
  api.use('/reactions', reactionRoutes);
  api.use('/bookmarks', bookmarkRoutes);
  api.use('/2fa', twofaRoutes);
  api.use('/conversations', conversationRoutes);
  api.use('/messages', messageRoutes);
  api.use('/notifications', notificationRoutes);
  api.use('/admin/settings', adminSettingsRoutes);
  api.use('/admin/users', userAdminRoutes);
  api.use('/drafts', draftRoutes);
  api.use('/newsletter', newsletterRoutes);
  api.use('/users', userRoutes);
  api.use('/tags', tagRoutes);
  api.use('/analytics', analyticsRoutes);
  api.use('/sponsors', sponsorRoutes);

  // Projects public + sync public
  api.use('/projects', projectRoutes);
  api.use('/projects', projectSyncRoutes);

  // NEW: admin-only sync endpoints
  api.use('/', projectSyncAdminRoutes);

  root.use('/api', api);

  // --- Non-API (public) routes: sitemaps, etc. ---
  root.use('/', sitemapRoute);

  return root;
}
