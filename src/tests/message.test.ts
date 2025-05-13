// tests/chat/message.test.ts
import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/User';
import Conversation from '../../src/models/Conversation';
import { issueTestToken } from './helpers/cookie';

let userA: any, tokenA: string, conversation: any;

beforeAll(async () => {
  userA = await User.create({
    name: 'User A',
    username: 'userA',
    email: 'a@example.com',
    password: '123456',
  });

  tokenA = issueTestToken(userA._id);

  conversation = await Conversation.create({ participants: [userA._id] });
});

describe('Message Routes', () => {
  it('should send a message', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ conversationId: conversation._id, text: 'Hello' });

    expect(res.status).toBe(201);
    expect(res.body.text).toBe('Hello');
  });

  it('should get messages from conversation', async () => {
    const res = await request(app)
      .get(`/api/messages/${conversation._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should block unauthenticated access', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ conversationId: conversation._id, text: 'Hey' });

    expect(res.status).toBe(401);
  });
});
