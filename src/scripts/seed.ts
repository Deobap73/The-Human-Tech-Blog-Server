// /src/scripts/seed.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from '../models/Post';
import Category from '../models/Category';
import User from '../models/User';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import Sponsor from '../models/Sponsor';
import Tag from '../models/Tag';

dotenv.config();

const toSlug = (str: string): string =>
  str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('📦 Connected to MongoDB');

    console.log('🔄 Cleaning collections...');
    await Promise.all([
      Post.deleteMany(),
      Category.deleteMany(),
      User.deleteMany(),
      Tag.deleteMany(),
      Message.deleteMany(),
      Conversation.deleteMany(),
      Sponsor.deleteMany(),
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
    // Extra normal users
    const maria = new User({
      name: 'Maria',
      email: 'maria@example.com',
      password: '123456',
      role: 'user',
    });
    const john = new User({
      name: 'John',
      email: 'john@example.com',
      password: '123456',
      role: 'user',
    });
    const sofia = new User({
      name: 'Sofia',
      email: 'sofia@example.com',
      password: '123456',
      role: 'user',
    });

    await Promise.all([
      berto.save(),
      berit.save(),
      alex.save(),
      maria.save(),
      john.save(),
      sofia.save(),
    ]);

    console.log('🏷️ Creating tags...');
    const tagList = [
      { name: 'agile', description: 'Agile practices', color: '#1da1f2' },
      { name: 'teamwork', description: 'Teamwork', color: '#2995e2' },
      { name: 'ux', description: 'User Experience', color: '#a1a1a3' },
      { name: 'design', description: 'Design', color: '#23262f' },
      { name: 'career', description: 'Career', color: '#2ecc40' },
      { name: 'tools', description: 'Tools', color: '#17a2b8' },
      { name: 'blog', description: 'Blogging', color: '#ff9800' },
      { name: 'retro', description: 'Retro', color: '#f41919' },
    ];
    // Cria as tags já no formato correto
    const tagDocs = await Tag.insertMany(
      tagList.map((tag) => ({
        slug: toSlug(tag.name),
        color: tag.color,
        translations: {
          en: {
            name: tag.name,
            description: tag.description,
          },
        },
      }))
    );
    const getTagId = (name: string) =>
      tagDocs.find((tag) => tag.translations.en.name === name)?._id;

    console.log('🏷️ Creating categories...');
    const categories = await Category.insertMany([
      {
        translations: {
          en: {
            name: 'Agile Projects',
            description: 'All about agile methodologies and teams.',
          },
        },
        slug: 'agile-projects',
        logo: 'agileProjects.webp',
      },
      {
        translations: {
          en: {
            name: 'Frontend UX',
            description: 'User experience and frontend practices.',
          },
        },
        slug: 'frontend-ux',
        logo: 'frontEndUx.webp',
      },
      {
        translations: {
          en: {
            name: 'Tech Career',
            description: 'Career growth and tips for tech professionals.',
          },
        },
        slug: 'tech-career',
        logo: 'teckCareer.webp',
      },
      {
        translations: {
          en: {
            name: 'Tech Tools',
            description: 'Best tools and resources for modern devs.',
          },
        },
        slug: 'tech-tools',
        logo: 'teckTools.webp',
      },
      {
        translations: {
          en: {
            name: 'Personal Reflections',
            description: 'Insights and personal thoughts on technology.',
          },
        },
        slug: 'personal-reflections',
        logo: 'personalReflections.webp',
      },
    ]);
    const getCategoryId = (slug: string) => categories.find((c) => c.slug === slug)?._id;

    console.log('📝 Creating posts...');
    const posts = [
      {
        translations: {
          en: {
            title: 'The Human Side of Agile Development',
            description: 'Exploring how agile methodologies affect teams.',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
          },
        },
        slug: toSlug('The Human Side of Agile Development'),
        image: '/images/1.jpg',
        status: 'published',
        tags: [getTagId('agile'), getTagId('teamwork')],
        author: berto._id,
        categories: [getCategoryId('agile-projects')],
      },
      {
        translations: {
          en: {
            title: 'UX Design: Bridging Humans and Technology',
            description: 'UX connects humans and digital interfaces.',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
          },
        },
        slug: toSlug('UX Design: Bridging Humans and Technology'),
        image: '/images/2.jpg',
        status: 'published',
        tags: [getTagId('ux'), getTagId('design')],
        author: berit._id,
        categories: [getCategoryId('frontend-ux')],
      },
      {
        translations: {
          en: {
            title: 'Navigating a Career in Tech',
            description: 'Reflections on tech career paths.',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
          },
        },
        slug: toSlug('Navigating a Career in Tech'),
        image: '/images/3.jpg',
        status: 'published',
        tags: [getTagId('career')],
        author: alex._id,
        categories: [getCategoryId('tech-career')],
      },
      {
        translations: {
          en: {
            title: 'Essential Tools for Modern Developers',
            description: 'Top tools for productivity in dev work.',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
          },
        },
        slug: toSlug('Essential Tools for Modern Developers'),
        image: '/images/4.jpg',
        status: 'published',
        tags: [getTagId('tools')],
        author: berto._id,
        categories: [getCategoryId('tech-tools')],
      },
      {
        translations: {
          en: {
            title: 'Why I Write About Technology',
            description: 'The power of sharing knowledge in tech.',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
          },
        },
        slug: toSlug('Why I Write About Technology'),
        image: '/images/5.jpg',
        status: 'published',
        tags: [getTagId('blog')],
        author: berit._id,
        categories: [getCategoryId('personal-reflections')],
      },
      {
        translations: {
          en: {
            title: 'Old Programming Techniques',
            description:
              'Explora as técnicas de programação clássicas que moldaram o desenvolvimento de software. Descobre como princípios antigos continuam a influenciar o código moderno..',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
          },
        },
        slug: toSlug('Old Programming Techniques'),
        image: '/images/6.jpg',
        status: 'published',
        tags: [getTagId('retro')],
        author: alex._id,
        categories: [getCategoryId('tech-career')],
      },
    ];

    for (const postData of posts) {
      const post = new Post(postData);
      await post.save();
    }

    console.log('🤝 Creating sponsors...');
    const sponsors = [
      {
        name: 'Cloudinary',
        logoUrl: '/images/cloudinary.webp',
        website: 'https://cloudinary.com',
      },
      {
        name: 'Confluence',
        logoUrl: '/images/confluence.webp',
        website: 'https://www.atlassian.com/software/confluence',
      },
      {
        name: 'Hostinger',
        logoUrl: '/images/hostinger.webp',
        website: 'https://www.hostinger.com',
      },
      {
        name: 'Jira',
        logoUrl: '/images/jira.webp',
        website: 'https://www.atlassian.com/software/jira',
      },
      {
        name: 'Scrum',
        logoUrl: '/images/scrum.webp',
        website: 'https://www.scrum.org/',
      },
    ];
    await Sponsor.insertMany(sponsors);
    console.log('✅ Sponsors created');

    console.log('💬 Creating conversations and messages...');
    // Berto <-> outros users (cada conversa 1:1)
    const convs = await Promise.all([
      Conversation.create({ participants: [berto._id, alex._id] }),
      Conversation.create({ participants: [berto._id, maria._id] }),
      Conversation.create({ participants: [berto._id, john._id] }),
      Conversation.create({ participants: [berto._id, sofia._id] }),
    ]);

    await Message.insertMany([
      // Berto <-> Alex
      { text: 'Hi Alex, welcome to the chat!', sender: berto._id, conversation: convs[0]._id },
      { text: 'Thanks Berto! Glad to be here.', sender: alex._id, conversation: convs[0]._id },
      // Berto <-> Maria
      { text: 'Bom dia Maria, tudo bem?', sender: berto._id, conversation: convs[1]._id },
      { text: 'Olá Berto, tudo ótimo!', sender: maria._id, conversation: convs[1]._id },
      // Berto <-> John
      { text: 'Hello John! Any tech news today?', sender: berto._id, conversation: convs[2]._id },
      {
        text: "Hey Berto, not yet! But I'll let you know.",
        sender: john._id,
        conversation: convs[2]._id,
      },
      // Berto <-> Sofia
      {
        text: 'Sofia, precisas de ajuda com o projeto?',
        sender: berto._id,
        conversation: convs[3]._id,
      },
      { text: 'Sim Berto, podes ligar mais tarde?', sender: sofia._id, conversation: convs[3]._id },
    ]);

    console.log(
      '✅ Seed completed with posts, users, categories, tags, sponsors, conversations and messages'
    );
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
