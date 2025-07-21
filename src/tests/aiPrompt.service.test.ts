// File: src/tests/aiPrompt.service.test.ts
import mongoose from 'mongoose';
import { getAllAiPrompts, createAiPromptDirect } from '../services/aiPromptService';

describe('AI Prompt Service', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI!);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should create and retrieve an AI Prompt', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const data = {
      translations: { en: { title: 'Test', content: '...', description: '...' } },
    };

    const created = await createAiPromptDirect(userId, data as any);
    expect(created.isAiPrompt).toBe(true);

    const prompts = await getAllAiPrompts({ author: userId });
    expect(prompts.find((p) => p.slug === created.slug)).toBeDefined();
  });
});
