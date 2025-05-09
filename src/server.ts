// src/server.ts
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const PORT = env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('📦 Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`\n🚀 Server ready at: http://localhost:${PORT}`);
      console.log(`📚 API docs: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
