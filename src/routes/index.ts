// ./src/routes/index.ts
import { Router } from 'express';

import automationTokenRoutes from './automationTokenRoutes';
import postAutomationRoutes from './postAutomationRoutes';
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

import projectRoutes from './projectRoutes';
import projectSyncRoutes from './projectSyncRoutes';
import adminMaintenanceRoutes from './adminMaintenanceRoutes';

import projectSyncAdminRoutes from './projectSyncAdminRoutes';

// NEW
import uploadRoutes from './uploadRoutes';

export function buildRootRouter() {
  const root = Router();

  const api = Router();

  api.use('/', automationTokenRoutes);
  api.use('/', postAutomationRoutes);
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

  api.use('/projects', projectRoutes);
  api.use('/projects', projectSyncRoutes);

  api.use('/', projectSyncAdminRoutes);
  api.use('/', adminMaintenanceRoutes);

  // NEW: upload routes
  api.use('/', uploadRoutes);

  root.use('/api', api);

  root.use('/', sitemapRoute);

  return root;
}
