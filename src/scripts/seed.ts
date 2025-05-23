// src/scripts/seed.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from '../models/Post';
import Category from '../models/Category';
import User from '../models/User';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('📦 Connected to MongoDB');

    console.log('🔄 Cleaning collections...');
    await Promise.all([
      Post.deleteMany(),
      Category.deleteMany(),
      User.deleteMany(),
      Message.deleteMany(),
      Conversation.deleteMany(),
    ]);

    console.log('👤 Creating users...');
    const berto = new User({
      name: 'berto',
      email: 'berto@example.com',
      password: '123456',
      role: 'admin',
    });
    const berit = new User({
      name: 'berit',
      email: 'berit@example.com',
      password: '123456',
      role: 'editor',
    });
    const alex = new User({
      name: 'Alex',
      email: 'alex@example.com',
      password: '123456',
      role: 'user',
    });

    await Promise.all([berto.save(), berit.save(), alex.save()]);

    console.log('🏷️ Creating categories...');
    const categories = await Category.insertMany([
      { name: 'Agile Projects', slug: 'agile-projects', logo: 'agileProjects.webp' },
      { name: 'Frontend UX', slug: 'frontend-ux', logo: 'frontEndUx.webp' },
      { name: 'Tech Career', slug: 'tech-career', logo: 'teckCareer.webp' },
      { name: 'Tech Tools', slug: 'tech-tools', logo: 'teckTools.webp' },
      {
        name: 'Personal Reflections',
        slug: 'personal-reflections',
        logo: 'personalReflections.webp',
      },
    ]);

    const getCategoryId = (name: string) => categories.find((c) => c.name === name)?._id;

    console.log('📝 Creating posts...');
    const posts = [
      {
        title: 'The Human Side of Agile Development',
        description: 'Exploring how agile methodologies affect teams.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        image: '/images/1.jpg',
        status: 'published',
        tags: ['agile', 'teamwork'],
        author: berto._id,
        categories: [getCategoryId('Agile Projects')],
      },
      {
        title: 'UX Design: Bridging Humans and Technology',
        description: 'UX connects humans and digital interfaces.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        image: '/images/2.jpg',
        status: 'published',
        tags: ['ux', 'design'],
        author: berit._id,
        categories: [getCategoryId('Frontend UX')],
      },
      {
        title: 'Navigating a Career in Tech',
        description: 'Reflections on tech career paths.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        image: '/images/3.jpg',
        status: 'published',
        tags: ['career'],
        author: alex._id,
        categories: [getCategoryId('Tech Career')],
      },
      {
        title: 'Essential Tools for Modern Developers',
        description: 'Top tools for productivity in dev work.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        image: '/images/4.jpg',
        status: 'published',
        tags: ['tools'],
        author: berto._id,
        categories: [getCategoryId('Tech Tools')],
      },
      {
        title: 'Why I Write About Technology',
        description: 'The power of sharing knowledge in tech.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        image: '/images/5.jpg',
        status: 'published',
        tags: ['blog'],
        author: berit._id,
        categories: [getCategoryId('Personal Reflections')],
      },
      {
        title: 'Old Programming Techniques',
        description: 'Retrospective on coding in the 2000s.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        image: '/images/6.jpg',
        status: 'published',
        tags: ['retro'],
        author: alex._id,
        categories: [getCategoryId('Tech Career')],
      },
    ];

    for (const postData of posts) {
      const post = new Post(postData);
      await post.save();
    }

    console.log('💬 Creating conversations and messages...');
    const conversation = await Conversation.create({ members: [berto._id, berit._id] });

    await Message.insertMany([
      { text: 'Hi berit, welcome!', sender: berto._id, conversation: conversation._id },
      { text: 'Thanks berto!', sender: berit._id, conversation: conversation._id },
      { text: 'Hey, can we chat tomorrow?', sender: alex._id, conversation: conversation._id },
    ]);

    console.log('✅ Seed completed with posts, users, categories and messages');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
