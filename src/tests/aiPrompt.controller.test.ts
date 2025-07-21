// File: src/tests/aiPrompt.controller.test.ts
import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';

beforeAll(async () => await mongoose.connect(process.env.MONGO_URI!));
afterAll(async () => await mongoose.disconnect());

describe('AI Prompt Controller', () => {
  it('GET /api/ai-prompts --> array of prompts', async () => {
    const res = await request(app).get('/api/ai-prompts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
