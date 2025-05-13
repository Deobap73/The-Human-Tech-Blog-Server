// tests/chat/conversation.test.ts
import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/User';
import { issueTestToken } from './helpers/cookie';

let userA: any, userB: any, tokenA: string;

beforeAll(async () => {
  userA = await User.create({
    name: 'User A',
    username: 'userA',
    email: 'a@example.com',
    password: '123456',
  });

  userB = await User.create({
    name: 'User B',
    username: 'userB',
    email: 'b@example.com',
    password: '123456',
  });

  tokenA = issueTestToken(userA._id);
});

describe('Conversation Routes', () => {
  it('should create a conversation', async () => {
    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ senderId: userA._id, receiverId: userB._id });

    expect(res.status).toBe(201);
    expect(res.body.participants).toContainEqual(userA._id.toString());
  });

  it('should return conversations for a user', async () => {
    const res = await request(app)
      .get(`/api/conversations/${userA._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should block unauthenticated access', async () => {
    const res = await request(app)
      .post('/api/conversations')
      .send({ senderId: userA._id, receiverId: userB._id });

    expect(res.status).toBe(401);
  });
});
