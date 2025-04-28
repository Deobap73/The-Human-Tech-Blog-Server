// The-Human-Tech-Blog-Server/src/controllers/adminController.ts
import { Request, Response } from 'express';
import User from '../models/User';
// import Post from '../models/Post'; // (iremos criar esse model mais tarde)
// import Category from '../models/Category'; // (iremos criar esse model mais tarde)

export const getAdminDashboard = async (_req: Request, res: Response) => {
  try {
    const usersCount = await User.countDocuments();
    // const postsCount = await Post.countDocuments();
    // const categoriesCount = await Category.countDocuments();

    return res.status(200).json({
      message: 'Admin dashboard fetched successfully',
      data: {
        users: usersCount,
        // posts: postsCount,
        // categories: categoriesCount,
      },
    });
  } catch (error) {
    console.error('[Admin Dashboard]', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard metrics' });
  }
};
