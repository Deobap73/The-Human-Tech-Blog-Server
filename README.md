# <h1 align="center" >The Human Tech Blog — Backend (blog-server) — by Deolindo Baptista </h1>

A robust, secure, and scalable backend built with Node.js, Express, and TypeScript to power the **The Human Tech Blog**. This backend manages post creation, authentication, comments, and category APIs, integrated with MongoDB and JWT-based access control.

<br>

---

<br>

## 🏗️ Technologies Used

<br>

| Category             | Tech Stack                          |
| -------------------- | ----------------------------------- |
| Node.js + Express.js | Web framework                       |
| TypeScript           | Strongly typed JavaScript           |
| MongoDB Atlas        | Cloud-hosted NoSQL database         |
| Mongoose             | ODM for MongoDB                     |
| Redis                | Session store (via connect-redis)   |
| JWT                  | Authentication & Authorization      |
| Passport.js          | Google & GitHub OAuth2 strategies   |
| Cloudinary           | Image upload support (via frontend) |
| dotenv               | Environment variable management     |

<br>

---

<br>

## 📁 Project Structure

<br>

```txt
blog-server/
├── src/
│   ├── controllers/        # Logic for routes (auth, posts, comments)
│   ├── middleware/         # JWT validation middleware
│   ├── models/             # Mongoose schemas (User, Post, Comment, Category)
│   ├── routes/             # Express routes grouped by module
│   ├── utils/              # Mongo connection, helpers
│   └── index.ts            # Entry point
├── test-db.ts              # MongoDB connection test script
├── .env                    # Environment variables
├── .dockerignore           # Ignored files if dockerized
├── package.json            # Scripts & dependencies
└── tsconfig.json           # TypeScript compiler options
```

---

<br>

## 🚀 Features

<br>

✅ Authentication

- Email/Password login (JWT)

- Google & GitHub OAuth2 (Passport.js)

- Redis-backed session management (for OAuth)

- express-session with connect-redis

✅ Post System

- CRUD routes

- Rich text + Cloudinary image upload

✅ Comment System

- Authenticated posting

- Auto-populated with user data

✅ Categories

- Auto-generated category tags

✅ MongoDB Integration

- Uses MongoDB Atlas with Mongoose ODM

- Connection managed via connect.ts

✅ Scalable Architecture

- Clean controller/service layering

- Stateless JWT API + stateful session fallback

<br>

---

<br>

## 🔐 Environment Variables (.env)

<br>

```txt
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net
JWT_SECRET=your_jwt_secret

# Redis
REDIS_URL=redis://default:<password>@<redis-host>.railway.internal:6379

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Frontend redirect
CLIENT_URL=https://your-frontend.netlify.app

# Cloudinary (Frontend uses VITE_)
VITE_CLOUDINARY_CLOUD_NAME=your_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

Note: In production, use .env.production or Railway’s environment manager.

<br>

---

<br>

## 🔐 Authentication how it work

1. Authentication Types:

- Email/password login (/login, /register)

- Google OAuth (/google, /google/callback)

- GitHub OAuth (/github, /github/callback)

- Token refresh (/refresh)

2. Security Features:

- HTTP-only cookies for token storage

- CSRF protection with sameSite cookies

- Short-lived access tokens (2 hours)

- Secure flag in production (HTTPS only)

3. OAuth Flow:

![OAuth Flow](https://github.com/Deobap73/The-Human-Tech-Blog-Server/blob/7855eec143e6e0077d39056f91cc2bae73b2d6dd/src/assets/becfb1.png)

4. Token Refresh:

- Uses a separate refresh token

- Creates new access token without requiring new login

- Handles token expiration gracefully

5. Error Handling:

- 401 for missing tokens

- 403 for invalid tokens

- Redirects for OAuth failures

#### This implementation provides:

- Multiple login options for users

- Secure token management

- Clear separation of authentication methods

- Easy integration with frontend applications

<br>

## 💻 Getting Started

<br>

1. 🔨 Install dependencies:

```txt
npm install
```

2. ▶️ Run in dev mode:

```txt
npm run dev
```

3. 🏗️ Build project:

```txt
   npm run build
```

4. Start (production):

```txt
npm start
```

<br>

---

<br>

## 🧪 Test MongoDB Connection

<br>

Run a simple test to ensure the DB is reachable:

```txt
npx ts-node test-db.ts
```

<br>

---

<br>

## 📡 API Endpoints

<br>

1. 🔑 Auth

```txt
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/google
GET  /api/auth/github
```

2. 📝 Posts

```txt
GET    /api/posts
GET    /api/posts/:slug
POST   /api/posts        (Protected)
```

3. 💬 Comments

```txt
GET    /api/comments?postSlug=slug
POST   /api/comments     (Protected)
```

4. 🗂️ Categories

```txt
GET    /api/categories
```

<br>

---

<br>

## 🌍 Deployment (Railway + Redis)

Images added in the post creation page are uploaded to [Cloudinary](https://cloudinary.com/) using unsigned upload presets.

### 🔧 Railway Steps:

1. Push backend repo to GitHub

2. Railway: New project → Deploy from GitHub

3. Add .env variables (including REDIS_URL)

4. Railway → Add Redis plugin

5. Copy Redis internal URL into REDIS_URL

6. Done 🎉

### 🔑🔥 Why Redis?

Redis replaces the insecure in-memory MemoryStore used by express-session:

- 🧠 Scalable

-⚡ Fast in production

- 🔐 Secure token/session isolation Minimum Variables:

<br>

---

<br>

## 👤 Author

Built and maintained by Deolindo Baptista
MIT License.
Free for personal use.
Not allowed for commercial resale.

<br>

---

<br>

## 🧪 Want to contribute?

1. Fork the repo

2. Create a feature branch (feat/new-feature)

3. Open a pull request with a detailed description

<br>

---

<br>

## 🎉 Final Notes

This project is fully audit-verified, scalable, and ideal for personal blog platforms.

Happy coding! ✨

---
