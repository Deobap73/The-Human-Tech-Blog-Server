# <h1 align="center">The Human Tech Blog — Backend (blog-server) — by Deolindo Baptista</h1>

A robust, secure, and scalable backend built with Node.js, Express, and TypeScript to power the **The Human Tech Blog**. Handles post creation, authentication (JWT & OAuth), comment management, category tags, token lifecycle with Redis, and now includes **Two-Factor Authentication (2FA)** for admins.

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
│   ├── scripts/              # DB seeding scripts
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
- 2FA via Speakeasy (TOTP with QR code)

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

## 🔒 How Auth Works

1. **Login Flows**

   - Email/password → `/api/auth/login`
   - Google OAuth2 → `/api/auth/google`
   - GitHub OAuth2 → `/api/auth/github`

2. **Tokens**

   - Short-lived `accessToken` (JWT, 15 min)
   - Long-lived `refreshToken` (Redis + cookie, 7d)
   - Refresh flow: `/api/auth/refresh` replaces token

3. **2FA (Two-Factor Authentication)**

   - Enabled for admins only
   - `/api/2fa/generate` → Generate TOTP secret + QR Code
   - `/api/2fa/verify` → Confirm token & enable 2FA
   - `/api/2fa/disable` → Disable 2FA

4. **Rotation & Revocation**

   - Redis TTL auto-expires stale tokens
   - Revoked on logout, rotated on refresh

5. **Secure Cookies**
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

Run tests with coverage:

```bash
npm run test:coverage
```

Open coverage report:

```bash
open coverage/lcov-report/index.html
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
