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

async function main() {
  if (process.env.CONFIRM_REINDEX !== '1') {
    // eslint-disable-next-line no-console
    console.error('Refusing to run without CONFIRM_REINDEX=1');
    process.exit(1);
  }

  await connectDB();

  const collection = mongoose.connection.collection('projects');

  // List existing indexes for visibility
  const indexes = await collection.indexes();
  console.log('Current indexes:', indexes);

  // Drop any index that starts with or includes text on title/excerpt or tags in the old shape
  for (const idx of indexes) {
    const name: string = idx.name;
    if (
      name.includes('title_text') ||
      name.includes('excerpt_text') ||
      name.includes('tags_1') ||
      name.includes('Project_text_search')
    ) {
      if (name !== 'Project_text_search') {
        try {
          console.log(`Dropping index: ${name}`);
          await collection.dropIndex(name);
        } catch (e) {
          console.warn(`Unable to drop index ${name}:`, (e as any)?.message);
        }
      }
    }
  }

  // Ensure our new text index exists (as defined on the schema)
  await Project.syncIndexes();
  console.log('Re-built Project indexes via syncIndexes().');

  // Print final indexes
  const finalIndexes = await collection.indexes();
  console.log('Final indexes:', finalIndexes);

  await mongoose.connection.close();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Index rebuild failed:', err);
  process.exit(1);
});
