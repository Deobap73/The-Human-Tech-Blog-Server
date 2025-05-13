// tests/setup/jest.setup.ts
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import { jest } from '@jest/globals';

dotenv.config({ path: '.env.test' });

let mongo: MongoMemoryServer;

// 🧪 Mock do Passport
jest.mock('passport', () => {
  const fake = {
    initialize: jest.fn(() => (_req: any, _res: any, next: any) => next()),
    session: jest.fn(() => (_req: any, _res: any, next: any) => next()),
    serializeUser: jest.fn().mockImplementation((...args: any[]) => {
      const done = args[1];
      if (typeof done === 'function') done(null, args[0]?.id || 'mock-id');
    }),
    deserializeUser: jest.fn().mockImplementation((...args: any[]) => {
      const done = args[1];
      if (typeof done === 'function') done(null, { id: args[0] });
    }),
    authenticate: jest.fn((strategy: string) => (_req: any, res: any) => {
      res.cookie('refreshToken', `mock-${strategy}-token`, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
      });
      res.redirect('http://localhost:5173');
    }),
    use: jest.fn(),
  };
  return fake;
});

// 🔌 Setup do Mongo em memória
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

// 🧼 Cleanup após todos os testes
afterAll(async () => {
  const db = mongoose.connection;
  if (db.readyState !== 0) {
    await db.dropDatabase();
    await db.close();
  }
  if (mongo) await mongo.stop();
});
