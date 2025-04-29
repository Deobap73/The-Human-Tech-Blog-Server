// The-Human-Tech-Blog-Server/src/controllers/categoryController.ts

import { Request, Response } from 'express';
import Category from '../models/Category';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, logo } = req.body;

    const exists = await Category.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const category = new Category({ name, slug, logo });
    await category.save();

    return res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    console.error('[Create Category]', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, logo } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug, logo },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Category not found' });

    return res.status(200).json({ message: 'Category updated', category: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });

    return res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete category' });
  }
};
