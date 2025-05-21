// ✅ The-Human-Tech-Blog-Server/src/controllers/categoryController.ts
import { Request, Response } from 'express';
import Category from '../models/Category';
import Post from '../models/Post';

export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.create(req.body);
    return res.status(201).json(category);
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
