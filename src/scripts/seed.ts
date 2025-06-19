// src/scripts/seed.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from '../models/Post';
import Category from '../models/Category';
import User from '../models/User';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import Sponsor from '../models/Sponsor';

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
    const joana = new User({
      name: 'Joana',
      email: 'joana@example.com',
      password: '123456',
      role: 'user',
    });
    const markus = new User({
      name: 'Markus',
      email: 'markus@example.com',
      password: '123456',
      role: 'user',
    });
    const mia = new User({
      name: 'Mia',
      email: 'mia@example.com',
      password: '123456',
      role: 'user',
    });

    await Promise.all([
      berto.save(),
      berit.save(),
      alex.save(),
      joana.save(),
      markus.save(),
      mia.save(),
    ]);

    // CATEGORIAS E POSTS... (mantém igual ao teu seed)

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
    function toSlug(str: string): string {
      return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

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
        tags: ['agile', 'teamwork'],
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
        tags: ['ux', 'design'],
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
        tags: ['career'],
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
        tags: ['tools'],
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
        tags: ['blog'],
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
        tags: ['retro'],
        author: alex._id,
        categories: [getCategoryId('tech-career')],
      },
    ];

    for (const postData of posts) {
      const post = new Post(postData);
      await post.save();
    }

    console.log('🤝 Creating sponsors...');
    await Sponsor.deleteMany();

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

    // CHAT DEMO DATA
    console.log('💬 Creating conversations and messages...');

    const chatUsers = [alex, joana, markus, mia];

    // Cria uma conversa 1:1 entre berto (admin) e cada user
    for (const normalUser of chatUsers) {
      const conv = await Conversation.create({ participants: [berto._id, normalUser._id] });

      await Message.insertMany([
        {
          text: `Hello ${normalUser.name}, how can I help you?`,
          sender: berto._id,
          conversation: conv._id,
        },
        {
          text: `Hi Berto! I just wanted to say hello and test the chat feature.`,
          sender: normalUser._id,
          conversation: conv._id,
        },
        {
          text: `Happy to hear from you, ${normalUser.name}. Let me know if you have questions!`,
          sender: berto._id,
          conversation: conv._id,
        },
      ]);
    }

    // Exemplo de conversa entre admin e berit (editor)
    const convAdminEditor = await Conversation.create({ participants: [berto._id, berit._id] });
    await Message.insertMany([
      { text: 'Hi Berit, welcome!', sender: berto._id, conversation: convAdminEditor._id },
      { text: 'Thanks Berto!', sender: berit._id, conversation: convAdminEditor._id },
    ]);

    console.log(
      '✅ Seed completed with posts, users, categories, sponsors, conversations and messages'
    );
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
