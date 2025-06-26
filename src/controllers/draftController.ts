// /src/controllers/draftController.ts
import { Request, Response } from 'express';
import Draft from '../models/Draft';
import { IUser } from '../types/User';
import Post from '../models/Post';
import { generateUniqueSlug } from '../utils/generateUniqueSlug';

// Utility to check if user is author
const isAuthor = (resource: any, userId: string) =>
  resource.author && resource.author.toString() === userId;

// ...

export const publishDraft = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const draft = await Draft.findOne({ _id: req.params.id, author: user._id });
    if (!draft) return res.status(404).json({ message: 'Draft not found' });

    const slug = await generateUniqueSlug(draft.title);

    // Copia TODAS as traduções presentes no draft, incluindo outros idiomas
    const translations: any = {};
    // Sempre inclui EN (main fields direto no draft)
    translations.en = {
      title: draft.title,
      content: draft.content,
      description: draft.description,
    };
    // Para cada idioma extra presente no draft.translations, copia também (ex: pt, de, es)
    if ((draft as any).translations) {
      for (const lang of Object.keys((draft as any).translations)) {
        if (lang !== 'en') {
          translations[lang] = (draft as any).translations[lang];
        }
      }
    }

    // Cast tags/categorias para ObjectId se necessário
    const toObjectId = (arr: any[] = []) =>
      arr.map((v) => (typeof v === 'string' ? v : v._id ? v._id : v));

    const newPost = new Post({
      slug,
      translations,
      author: draft.author,
      categories: toObjectId(draft.categories),
      tags: toObjectId(draft.tags),
      image: draft.image,
      status: 'published',
    });

    await newPost.save();
    await Draft.findByIdAndDelete(draft._id);

    return res.status(201).json({ message: 'Draft published successfully', post: newPost });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Publish Draft ERROR]', error.message, error.stack);
    } else {
      console.error('[Publish Draft ERROR]', error);
    }
    return res.status(500).json({ message: 'Failed to publish draft' });
  }
};
