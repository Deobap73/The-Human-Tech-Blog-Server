# <h1 align="center">The Human Tech Blog — Backend (blog-server) — by Deolindo Baptista</h1>

A robust, secure, and scalable backend built with Node.js, Express, and TypeScript to power the **The Human Tech Blog**. Handles post creation, authentication (JWT & OAuth), comment management, category tags, and token lifecycle with Redis.

---

## 🏠 Technologies Used

| Category             | Tech Stack                          |
| -------------------- | ----------------------------------- |
| Node.js + Express.js | Web framework                       |
| TypeScript           | Strongly typed JavaScript           |
| MongoDB Atlas        | Cloud-hosted NoSQL database         |
| Mongoose             | ODM for MongoDB                     |
| Redis                | Token/session revocation store      |
| JWT + Refresh Token  | Stateless auth + rotation flow      |
| Passport.js          | Google & GitHub OAuth2 strategies   |
| Cloudinary           | Image upload support (via frontend) |
| dotenv + envalid     | Environment variable validation     |

---

## 📁 Project Structure

```txt
blog-server/
├── src/
│   ├── controllers/        # Route handlers (auth, posts, comments, oauth)
│   ├── middleware/         # JWT validation & role-based guards
│   ├── models/             # Mongoose schemas (User, Post, Comment, etc)
│   ├── routes/             # Express route modules
│   ├── utils/              # JWT helpers, redis, issueTokens, cloudinary
│   ├── config/             # Redis, Passport, env parsing
│   └── app.ts              # Express app setup
├── test-db.ts              # Simple MongoDB connection test
├── .env / .env.test        # Environment variables
├── jest.config.js          # Test configuration
└── tsconfig.json           # TypeScript settings
```

---

## 🚀 Features

### ✅ Authentication (Advanced)

- Email/password login with access & refresh tokens
- Secure refresh token in cookie (httpOnly, sameSite)
- Google & GitHub OAuth2 with full token integration
- Stateless JWT for access, Redis for refresh
- Token rotation and revocation

### ✅ Posts & Comments

- Post CRUD (protected)
- Markdown content, image upload (Cloudinary)
- Comment creation (authenticated)

### ✅ Categories & Tags

- Category CRUD (admin only)
- Auto-association with posts

### ✅ Security Layers

- Role-based guards (`admin`, `editor`, etc)
- Passport.js social auth strategies
- Redis-powered token cleanup & revocation
- Express middlewares for CSRF-safe cookies

---

## 🔐 Environment Variables (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/thehumantechblog
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRATION=7d
REFRESH_TOKEN_EXPIRATION_MS=604800000

# Redis
REDIS_URL=redis://localhost:6379

# Cloudinary (frontend uses VITE_ prefix)
VITE_CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Frontend URL
CLIENT_URL=http://localhost:5173
```

---

## 🔒 How Auth Works

1. **Login Flows**

   - Email/password → `/api/auth/login`
   - Google OAuth2 → `/api/auth/google`
   - GitHub OAuth2 → `/api/auth/github`

2. **Tokens**

   - Short-lived `accessToken` (JWT, 15 min)
   - Long-lived `refreshToken` (Redis + cookie, 7d)
   - Refresh flow: `/api/auth/refresh` replaces token

3. **Rotation & Revocation**

   - Redis TTL auto-expires stale tokens
   - Revoked on logout, rotated on refresh

4. **Secure Cookies**

   - `httpOnly`, `secure`, `sameSite=strict`
   - Stored in browser, never exposed to JS

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

---

## 🚀 Deployment (Railway)

1. Push to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Add Redis plugin
4. Set environment variables via Railway
5. Done 🎉

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
