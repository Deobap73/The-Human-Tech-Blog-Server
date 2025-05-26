// src/controllers/categoryController.ts

import { Request, Response } from 'express';
import Category from '../models/Category';
import Post from '../models/Post';
import slugify from 'slugify';

// GET all categories with translation for current lang
export const getAllCategories = async (req: Request, res: Response) => {
  const lang = (req as any).lang || 'en';
  try {
    const categories = await Category.find();
    // Só devolve a tradução ativa + slug/logo
    const result = categories.map((cat) => {
      const translation = cat.translations[lang] ||
        cat.translations['en'] || { name: '', description: '' };
      return {
        _id: cat._id,
        slug: cat.slug,
        logo: cat.logo,
        translation,
      };
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// CREATE category multilíngue
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { translations, logo } = req.body;
    if (!translations || !translations.en?.name) {
      return res.status(400).json({ message: 'Category name (EN) is required' });
    }
    const slug = slugify(translations.en.name, { lower: true, strict: true });
    const category = await Category.create({ translations, logo, slug });
    return res.status(201).json(category);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error instanceof Error ? error.message : 'Invalid data' });
  }
};

// UPDATE category multilíngue
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { translations, logo } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.translations = translations;
    if (logo !== undefined) category.logo = logo;

    // Update slug if EN name changed
    if (translations.en && translations.en.name) {
      category.slug = slugify(translations.en.name, { lower: true, strict: true });
    }

    await category.save();
    return res.status(200).json(category);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error instanceof Error ? error.message : 'Invalid data' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    const postsUsingCategory = await Post.find({ categories: categoryId });

    if (postsUsingCategory.length > 0) {
      return res.status(400).json({ message: 'Cannot delete: Category is in use by posts' });
    }

    await Category.findByIdAndDelete(categoryId);
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete category' });
  }
};

// GET by slug (multilíngue)
export const getCategoryBySlug = async (req: Request, res: Response) => {
  const lang = (req as any).lang || 'en';
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const translation = category.translations[lang] ||
      category.translations['en'] || { name: '', description: '' };
    return res.status(200).json({
      _id: category._id,
      slug: category.slug,
      logo: category.logo,
      translation,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch category' });
  }
};

// GET posts by category slug (multilíngue)
export const getPostsByCategorySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const category = await Category.findOne({ slug });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const posts = await Post.find({ categories: category._id, status: 'published' })
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    console.error('[getPostsByCategorySlug]', error);
    return res.status(500).json({ message: 'Failed to fetch posts for category' });
  }
};
