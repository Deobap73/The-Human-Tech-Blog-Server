// src/server.ts
import 'module-alias/register';

import { env } from './config/env';
import app from './app';
import { connectDB } from './config/db';
import { createServer } from 'http';
import { setupSocket } from './socket';

const port = env.PORT;
const server = createServer(app);

connectDB()
  .then(() => {
    setupSocket(server);
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
