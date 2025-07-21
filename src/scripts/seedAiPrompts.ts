// File: scripts/seedAiPrompts.ts
// Seed script for AI Prompts demonstration

import mongoose from 'mongoose';
import Post from 'src/models/Post';

const MONGO_URI = process.env.MONGO_URI!;

const promptSeed = {
  slug: 'intro-to-ai-prompts',
  image: '',
  status: 'published',
  isAiPrompt: true,
  translations: {
    en: {
      title: 'Introduction to AI Prompts',
      description: 'Learn the basics of crafting effective AI prompts.',
      content: '<p>This is a sample AI prompt article...</p>',
    },
  },
  categories: [],
  tags: [],
  author: new mongoose.Types.ObjectId(),
};

async function main() {
  await mongoose.connect(MONGO_URI);
  const existing = await Post.findOne({ slug: promptSeed.slug });
  if (existing) {
    await Post.updateOne({ slug: promptSeed.slug }, promptSeed);
    console.log('🔄 AI Prompt updated!');
  } else {
    await Post.create(promptSeed);
    console.log('✅ AI Prompt seeded!');
  }
  await mongoose.disconnect();
}

main().catch(console.error);
