// /src/scripts/seedProjects.ts
'use strict';

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Project } from '../models/Project';

async function run() {
  try {
    await connectDB();
    await Project.deleteMany({});

    await Project.create([
      {
        slug: 'hairdresser-booking-app-mobile-flow',
        type: 'ux-figma',
        source: 'figma',
        title: 'Hairdresser Booking App – Mobile Flow',
        excerpt: 'Early-stage prototype exploring booking flows.',
        tags: ['mobile', 'booking', 'salon'],
        links: {
          figma: 'https://www.figma.com/file/xxxxx', // substitui
          figmaEmbedUrl:
            'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2Fxxxxx',
        },
        isPublic: true,
      },
      {
        slug: 'the-human-tech-blog-home-redesign',
        type: 'frontend-ui',
        source: 'mixed',
        title: 'The Human Tech Blog – Home Redesign (UI)',
        excerpt: 'UI exploration + implementation plan.',
        tags: ['react', 'vite', 'scss'],
        links: {
          github: 'https://github.com/Deobap73/The-Human-Tech-Blog-React',
          blog: 'https://thehumantechblog.com/en/posts/home-redesign',
        },
        isPublic: true,
      },
    ]);

    // eslint-disable-next-line no-console
    console.log('Seeded projects.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Seed projects failed:', err);
    process.exit(1);
  }
}

run();
