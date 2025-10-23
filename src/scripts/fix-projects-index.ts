// /src/scripts/fix-projects-index.ts
'use strict';

/**
 * One-off maintenance script to rebuild the Project text index.
 * Usage:
 *  NODE_ENV=production CONFIRM_REINDEX=1 ts-node src/scripts/fix-projects-index.ts
 */

import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Project } from '../models/Project';

async function main(): Promise<void> {
  if (process.env.CONFIRM_REINDEX !== '1') {
    // eslint-disable-next-line no-console
    console.error('Refusing to run without CONFIRM_REINDEX=1');
    process.exit(1);
  }

  await connectDB();

  const collection = mongoose.connection.collection('projects');

  // List existing indexes for visibility
  const indexes = await collection.indexes();
  // eslint-disable-next-line no-console
  console.log('Current indexes:', indexes);

  // Drop any index that matches the legacy shapes
  for (const idx of indexes) {
    // `name` can be undefined in typings, normalize to string safely
    const name = String(idx.name ?? '');

    if (!name) continue;

    const looksLegacy =
      name.includes('title_text') ||
      name.includes('excerpt_text') ||
      name.includes('tags_1') ||
      name.includes('title_1_excerpt_1') || // defensive
      name.includes('title_text_excerpt_text_tags_1'); // legacy example

    // Do NOT drop the desired target index if it already exists
    if (looksLegacy && name !== 'Project_text_search') {
      try {
        // eslint-disable-next-line no-console
        console.log(`Dropping index: ${name}`);
        await collection.dropIndex(name);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Unable to drop index ${name}:`, (e as any)?.message);
      }
    }
  }

  // Ensure our new text index exists (as defined on the schema)
  await Project.syncIndexes();
  // eslint-disable-next-line no-console
  console.log('Re-built Project indexes via syncIndexes().');

  // Print final indexes
  const finalIndexes = await collection.indexes();
  // eslint-disable-next-line no-console
  console.log('Final indexes:', finalIndexes);

  await mongoose.connection.close();
  // eslint-disable-next-line no-console
  console.log('Done.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Index rebuild failed:', err);
  process.exit(1);
});
