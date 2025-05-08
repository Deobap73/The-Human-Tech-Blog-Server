// src/tests/auth.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import User from '../models/User';
import { env } from '../config/env';

let mongo: MongoMemoryServer;
let adminToken: string;
let editorToken: string;
let postId: string;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: 'test' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Auth Flow', () => {
  it('should create an admin and an editor for content routes', async () => {
    await request(app).post('/api/setup/create-admin').send({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'adminpass',
      key: env.SETUP_KEY,
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'adminpass',
    });
    adminToken = adminLogin.body.accessToken;
    console.log('adminToken', adminToken);

    await request(app).post('/api/auth/register').send({
      name: 'EditorUser',
      email: 'editor@test.com',
      password: '123456',
    });
    await User.updateOne({ email: 'editor@test.com' }, { role: 'editor' });

    const editorLogin = await request(app).post('/api/auth/login').send({
      email: 'editor@test.com',
      password: '123456',
    });
    editorToken = editorLogin.body.accessToken;
    console.log('editorToken', editorToken);

    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'General', slug: 'general', logo: 'https://via.placeholder.com/100' });
    console.log('category creation', catRes.status, catRes.body);
  });

  it('should create a post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        title: 'Post Test',
        description: 'Short summary of the post',
        content: 'This is the content of the post.',
        image: 'https://via.placeholder.com/150',
        status: 'draft',
      });
    console.log('create post res', res.status, res.body);
    expect(res.status).toBe(201);
    postId = res.body.post._id; // Ajuste para pegar o ID correto
  });

  it('should get post by id', async () => {
    const res = await request(app).get(`/api/posts/${postId}`);
    console.log('get post by id', res.status, res.body);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(postId);
  });

  it('should create comment on a post', async () => {
    const res = await request(app)
      .post('/api/comments') // Ajuste para a rota correta
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        postId: postId, // Enviar postId no body
        text: 'Great post!', // Usar 'text' em vez de 'content'
      });
    console.log('create comment res', res.status, res.body);
    expect(res.status).toBe(201);
    expect(res.body.text).toBe('Great post!'); // Verificar 'text' em vez de 'content'
  });

  it('should get comments for post', async () => {
    const res = await request(app).get(`/api/comments/${postId}`);
    console.log('get comments res', res.status, res.body);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should fail to comment without auth', async () => {
    const res = await request(app).post('/api/comments').send({
      postId: postId,
      text: 'Anonymous comment',
    });
    console.log('unauth comment res', res.status, res.body);
    expect(res.status).toBe(401);
  });
});
