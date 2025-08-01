# <h1 align="center">[_The Human Tech Blog_](https://thehumantechblog.com) — Backend (blog-server) — by Deolindo Baptista</h1>

A robust, secure, and scalable backend built with Node.js, Express, and TypeScript to power the **The Human Tech Blog**. Handles post creation, authentication (JWT & OAuth), comment management, category tags, token lifecycle with Redis, and now includes **Two-Factor Authentication (2FA)** for admins

<br> <br>
<img src="https://github.com/Deobap73/The-Human-Tech-Blog-React/blob/main/public/images/HomePage.webp">
<br> <br>

**NEW:**

- 🛠️ Professional DevOps scripts for database reset and admin setup (see **Database Maintenance & Admin Setup** below).
- 🧑‍💻 All critical CLI scripts are TypeScript, strict mode, with robust error handling and security in mind.

---

## 🏠 Technologies Used

| Category             | Tech Stack                           |
| -------------------- | ------------------------------------ |
| Node.js + Express.js | Web framework                        |
| TypeScript           | Strongly typed JavaScript            |
| MongoDB Atlas        | Cloud-hosted NoSQL database          |
| Mongoose             | ODM for MongoDB                      |
| Redis                | Token/session revocation store       |
| JWT + Refresh Token  | Stateless auth + rotation flow       |
| Passport.js          | Google & GitHub OAuth2 strategies    |
| Cloudinary           | Image upload support (via frontend)  |
| dotenv + envalid     | Environment variable validation      |
| Speakeasy            | Time-based One-Time Passwords (TOTP) |
| Inquirer             | Secure interactive CLI prompts       |

---

## 📁 Project Structure

```txt
blog-server/
├── src/
│   ├── app.ts                # Express app setup
│   ├── server.ts             # Server entry point
│   ├── config/               # Redis, Passport, Cloudinary, env parsing
│   ├── controllers/          # Route handlers (auth, posts, comments, 2FA, etc)
│   ├── middleware/           # JWT, CSRF, captcha, roles, 2FA guard
│   ├── models/               # Mongoose schemas (User, Post, Comment, etc)
│   ├── routes/               # Express route modules
│   ├── scripts/              # DB seeding, reset, admin creation
│   ├── services/             # Token services (JWT, refresh, etc)
│   ├── socket.ts             # WebSocket handling
│   ├── tests/                # Jest tests (unit/integration)
│   ├── types/                # TypeScript types (User, Express, etc)
│   └── utils/                # Token helpers, cloudinary, 2FA tools
├── coverage/                 # Jest coverage output (lcov, HTML)
├── .env / .env.test          # Environment configurations
├── jest.config.js           # Test runner configuration
├── package.json             # Dependencies & scripts
└── tsconfig.json            # TypeScript config
```

---

## 🚀 Features

### ✅ Authentication (Advanced)

- Email/password login with access & refresh tokens
- Secure refresh token in cookie (httpOnly, sameSite)
- Google & GitHub OAuth2 with full token integration
- Stateless JWT for access, Redis for refresh
- Token rotation and revocation
- **Two-Factor Authentication (2FA)** via TOTP for admin users

---

## 🧭 SEO Capabilities

The backend provides automatically generated and optimized XML sitemaps, ensuring search engines can crawl all types of content across all languages with precision and speed.

🌍 Supported Sitemap Types
| Type | Route | Description |
| ------------ | ------------------------- | -------------------------------- |
| Posts | `/sitemap-posts.xml` | Multilingual blog articles |
| QuickPosts | `/sitemap-quickposts.xml` | Short-form tech insights |
| AI Prompts | `/sitemap-prompts.xml` | Fun and shareable prompt content |
| Categories | `/sitemap-categories.xml` | SEO-friendly taxonomy indexing |
| Static Pages | `/sitemap-static.xml` | About, Contact, Legal, etc. |
| Index | `/sitemap-index.xml` | Sitemap index for Google Bot |

### ⚡ Gzipped Sitemaps

All routes also support .gz versions to ensure fast delivery and bandwidth savings:

```pgsql
https://api.thehumantechblog.com/sitemap-index.xml.gz
https://api.thehumantechblog.com/sitemap-posts.xml.gz
```

### 📌 SEO Features

✅ Multilingual support (/en, /pt, /es, /de)

✅ Sitemap auto-generation via content model

✅ Gzip compression in-memory with Node.js streams

✅ Dynamic lastmod from updatedAt

✅ Content priority and change frequency per entry

✅ Sitemap split per type, referenced in central index

<br>

---

### ✅ Posts & Comments

- Post CRUD (protected)
- Markdown content, image upload (Cloudinary)
- Comment creation (authenticated)

---

### ✅ Categories & Tags

- Category CRUD (admin only)
- Auto-association with posts

<br> <br>
<img src="https://github.com/Deobap73/The-Human-Tech-Blog-React/blob/main/public/images/CategoriesPage.webp">
<br> <br>

### ✅ Security Layers

- Role-based guards (`admin`, `editor`, etc)
- Passport.js social auth strategies
- Redis-powered token cleanup & revocation
- Express middlewares for CSRF-safe cookies
- 2FA via Speakeasy (TOTP with QR code)

## 💬 Chat Module — Backend Features & Architecture

The backend Chat module powers real-time, secure, and scalable messaging for The Human Tech Blog, enabling fast, reliable communication for all authenticated users.

### Core Features

- Real-time Messaging Engine
- RESTful API Endpoints
- Authentication & Security
- Data Model
- Notification Integration
- Scalability & Performance

### Roadmap & Future Improvements

- Group conversations (multi-user rooms)
- Media/file sharing in chat
- Message editing/deleting
- Real-time typing indicators
- End-to-end encryption (optional)
- Advanced moderation tools for admins

---

## 🛠️ Database Maintenance & Admin Setup

1. Reset the Database (Keep only Categories & Sponsors)
   Use this script to clean the database, removing all seeded/dev data except categories and sponsors.

```bash
npx ts-node src/scripts/reset-db.ts
```

2. Create the Real Admin User (Secure CLI Prompt)
   Creates a new admin interactively and securely (password input is hidden).

First, install dependencies:

```bash
npm install inquirer
```

Then run:

```bash
npx ts-node src/scripts/create-admin.ts
```

You will be prompted to enter the admin's name, email, and password (input is masked for security).

- The script ensures unique email and hashes the password.
- No sensitive data is stored in the code.

Repeat to add more admins if needed.

---

<br> <br>
<img src="https://github.com/Deobap73/The-Human-Tech-Blog-React/blob/main/public/images/AdminPage.webp">
<br> <br>

---

## 🔐 Environment Variables (.env)

```env
PORT=5000
MONGO_URI=*

# JWT
JWT_SECRET=****************************************
JWT_EXPIRATION=15m

# Frontend Env (Vite uses VITE_ prefix)
VITE_CLOUDINARY_CLOUD_NAME=*
VITE_CLOUDINARY_UPLOAD_PRESET=*
CLOUDINARY_API_KEY=*
CLOUDINARY_API_SECRET=******************

# OAuth Google
GOOGLE_CLIENT_ID=*
GOOGLE_CLIENT_SECRET=******************
GOOGLE_CALLBACK_URL=*

# OAuth GitHub
GITHUB_CLIENT_ID=*
GITHUB_CLIENT_SECRET=**************************
GITHUB_CALLBACK_URL=*

# Redirect to your frontend
CLIENT_URL=http://localhost:5173

# Setup Key
SETUP_KEY=********************

# Refresh Token
REFRESH_TOKEN_SECRET=*************************************
REFRESH_TOKEN_EXPIRATION=7d
REFRESH_TOKEN_EXPIRATION_MS=604800000 # 7 days in ms

 # Google reCAPTCHA
RECAPTCHA_SECRET=***********************************
```

---

## 💡 Getting Started

```bash
npm install
npm run dev       # dev mode
npm run build     # compile to dist/
npm start         # production start
```

Test MongoDB connection:

```bash
npx ts-node test-db.ts
```

Run Jest tests:

```bash
npx jest
```

Run tests with coverage:

```bash
npm run test:coverage
```

Open coverage report:

```bash
open coverage/lcov-report/index.html
```

---

## 🚀 Deployment to Railway

1. Ensure you have the Railway CLI installed:

   ```bash
   npm install -g railway

   ```

2. Login and link project:

railway login
railway link

3. Deploy with:

npm run deploy

4. Set environment variables in Railway dashboard under Settings > Variables.

5. Monitor logs:
   railway logs

---

## 📡 API Overview

### Auth

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/google /callback
GET    /api/auth/github /callback
POST   /api/auth/refresh
POST   /api/auth/logout
```

### Two-Factor Authentication (2FA)

```
GET    /api/2fa/generate   # Generate QR + secret (admin only)
POST   /api/2fa/verify     # Verify and enable 2FA
POST   /api/2fa/disable    # Disable 2FA
```

### Posts

```
GET    /api/posts
GET    /api/posts/:id
POST   /api/posts         # Authenticated (editor, admin)
```

### Comments

```
POST   /api/comments      # Authenticated
GET    /api/comments/:postId
```

### Categories

```
GET    /api/categories
POST   /api/categories    # Admin only
```

---

## 👨‍💼 Author

Created and maintained by **Deolindo Baptista**
Licensed under MIT. Use freely for educational or personal projects.

---

## 💪 Contribute

1. Fork the repo
2. Create a branch: `feat/my-feature`
3. Submit PR with details

Happy coding! ✨

<br> <br>

[![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=Deobap73)](https://github.com/anuraghazra/github-readme-stats)

![GitHub streak stats](https://streak-stats.demolab.com/?user=Deobap73) &nbsp;&nbsp;&nbsp;&nbsp; ![GitHub stats](https://github-readme-stats.vercel.app/api?username=Deobap73&show_icons=true&count_private=true)

[![trophy](https://github-profile-trophy.vercel.app/?username=Deobap73)](https://github.com/ryo-ma/github-profile-trophy)
