// src/controllers/postController.ts

import { Request, Response } from 'express';
import Post from '../models/Post';
import Draft from '../models/Draft';
import { IUser } from '../types/User';

export const publishDraft = async (req: Request, res: Response): Promise<Response> => {
  const draftId = req.params.id;
  const user = req.user as IUser;

  try {
    const draft = await Draft.findOne({ _id: draftId, author: user._id });
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found or not authorized' });
    }

    const newPost = new Post({
      title: draft.title,
      description: draft.description,
      content: draft.content,
      image: draft.image,
      tags: draft.tags,
      status: 'published',
      author: draft.author,
      categories: [],
    });

    await newPost.save();
    await Draft.findByIdAndDelete(draftId);

    return res.status(201).json({ message: 'Draft published successfully', post: newPost });
  } catch (error) {
    console.error('[Publish Draft]', error);
    return res.status(500).json({ message: 'Failed to publish draft' });
  }
};
