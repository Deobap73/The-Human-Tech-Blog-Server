// src/tests/twofa.test.ts

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import User from '../models/User';
import speakeasy from 'speakeasy';

let mongo: MongoMemoryServer;
let authToken: string;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: 'test' });

  await User.deleteMany({});

  // Criação do admin com save() para garantir execução de pre('save')
  const admin = new User({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  });
  await admin.save();

  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@example.com',
    password: 'admin123',
  });

  if (res.status !== 200) {
    const user = await User.findOne({ email: 'admin@example.com' });
    console.log('User in DB:', user);
    console.log('Password match:', user && (await user.comparePassword('admin123')));
    throw new Error(`Login failed: ${JSON.stringify(res.body)}`);
  }

  authToken = res.body.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('2FA Flow for Admins', () => {
  it('should generate a 2FA QR code and secret', async () => {
    const res = await request(app)
      .get('/api/2fa/generate')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.qrCode).toContain('data:image/png;base64');
    expect(res.body.secret).toBeDefined();
  });

  it('should verify 2FA token and activate 2FA', async () => {
    const generateRes = await request(app)
      .get('/api/2fa/generate')
      .set('Authorization', `Bearer ${authToken}`);

    const secret = generateRes.body.secret;
    const token = speakeasy.totp({ secret, encoding: 'base32' });

    const verifyRes = await request(app)
      .post('/api/2fa/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ token });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.message).toBe('2FA activated');

    const user = await User.findOne({ email: 'admin@example.com' });
    expect(user?.twoFactorEnabled).toBe(true);
  });

  it('should disable 2FA', async () => {
    const res = await request(app)
      .post('/api/2fa/disable')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('2FA disabled');

    const user = await User.findOne({ email: 'admin@example.com' });
    expect(user?.twoFactorEnabled).toBe(false);
  });
});
