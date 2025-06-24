// /src/scripts/reset-db.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import all models
import Post from '../models/Post';
import User from '../models/User';
import Tag from '../models/Tag';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import Draft from '../models/Draft';
import Notification from '../models/Notification';
import Reaction from '../models/Reaction';
import Bookmark from '../models/Bookmark';
import NewsletterSubscriber from '../models/NewsletterSubscriber';
import TokenBlacklist from '../models/TokenBlacklist';
import { UserActionLog } from '../models/UserActionLog';

// Only keep Category and Sponsor
dotenv.config();

/**
 * This script will remove all documents from the MongoDB database,
 * except for the collections 'categories' and 'sponsors'.
 * Use with caution.
 */
const resetDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('📦 Connected to MongoDB');

    // Remove all documents from these collections
    const deleteOps = [
      Post.deleteMany(),
      User.deleteMany(),
      Tag.deleteMany(),
      Message.deleteMany(),
      Conversation.deleteMany(),
      Draft.deleteMany(),
      Notification.deleteMany(),
      Reaction.deleteMany(),
      Bookmark.deleteMany(),
      NewsletterSubscriber.deleteMany(),
      TokenBlacklist.deleteMany(),
      UserActionLog.deleteMany(),
    ];

    await Promise.all(deleteOps);

    console.log(
      '✅ Database reset completed. Only categories and sponsors collections are untouched.'
    );
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during database reset:', err);
    process.exit(1);
  }
};

resetDatabase();
