// The-Human-Tech-Blog-Server/src/controllers/analyticsController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import Post from '../models/Post';
import Category from '../models/Category';
import Comment from '../models/Comment';

export const getKPIs = async (_req: Request, res: Response) => {
  try {
    // 1. Contagem total
    const [totalUsers, totalPosts, totalComments, totalCategories] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      Category.countDocuments(),
    ]);

    // 2. Contagem hoje (criados hoje)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [usersToday, postsToday] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: today } }),
      Post.countDocuments({ createdAt: { $gte: today } }),
    ]);

    // 3. Comentários pendentes de moderação
    const commentsPending = await Comment.countDocuments({ status: 'pending' });

    // 4. Top users (por nº de posts)
    const topUsersAgg = await Post.aggregate([
      { $group: { _id: '$author', posts: { $sum: 1 } } },
      { $sort: { posts: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
      {
        $project: {
          name: '$author.name',
          posts: 1,
        },
      },
    ]);

    // 5. Top categories (por nº de posts)
    const topCategoriesAgg = await Post.aggregate([
      { $unwind: '$categories' },
      { $group: { _id: '$categories', postsCount: { $sum: 1 } } },
      { $sort: { postsCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.name',
          slug: '$category.slug',
          logo: '$category.logo',
          postsCount: 1,
        },
      },
    ]);

    // 6. Distribuição de posts por categoria (pie chart)
    const postsPerCategoryAgg = await Post.aggregate([
      { $unwind: '$categories' },
      { $group: { _id: '$categories', value: { $sum: 1 } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $project: { name: '$category.name', value: 1 } },
    ]);

    // 7. Evolução semanal (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const usersWeek = await Promise.all(
      last7Days.map((d) => {
        const next = new Date(d);
        next.setDate(d.getDate() + 1);
        return User.countDocuments({ createdAt: { $gte: d, $lt: next } });
      })
    );

    const postsWeek = await Promise.all(
      last7Days.map((d) => {
        const next = new Date(d);
        next.setDate(d.getDate() + 1);
        return Post.countDocuments({ createdAt: { $gte: d, $lt: next } });
      })
    );

    return res.json({
      totalUsers,
      totalPosts,
      totalComments,
      totalCategories,
      postsToday,
      usersToday,
      commentsPending,
      usersWeek,
      postsWeek,
      postsPerCategory: postsPerCategoryAgg,
      topUsers: topUsersAgg,
      topCategories: topCategoriesAgg,
    });
  } catch (err) {
    console.error('[AnalyticsController] Error:', err);
    return res.status(500).json({ message: 'Failed to load analytics.' });
  }
};
