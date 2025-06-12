// The-Human-Tech-Blog-Server/src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { issueTokens } from '../utils/issueTokens';
import { env } from '../config/env';

// 🔐 Login com suporte a 2FA (se aplicável)
export const login = async (req: Request, res: Response) => {
  const { email, password, token } = req.body;
  console.log('Login attempt', { email });

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'admin' && user.twoFactorEnabled) {
      if (!token) {
        return res.status(401).json({
          message: '2FA token required',
          twoFactorRequired: true,
        });
      }

      const speakeasy = await import('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret || '',
        encoding: 'base32',
        token,
        window: 1,
      });

      if (!verified) {
        return res.status(401).json({ message: 'Invalid 2FA token' });
      }
    }

    const tokens = await issueTokens(user._id.toString(), res);

    // XSRF-TOKEN deve ser acessível por JavaScript para o frontend
    /* res.cookie('XSRF-TOKEN', tokens.accessToken, {
      // CUIDADO: Este XSRF-TOKEN DEVE ser o token CSRF, não o accessToken!
      httpOnly: false,
      sameSite: 'lax',
      secure: env.isProduction,
      maxAge: 60 * 60 * 1000, // 1 hora
    }); */

    // RefreshToken deve ser httpOnly e ter path: '/' para ser enviado em todas as requisições para o domínio.
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax', // Use 'lax' para localhost e produção para maior compatibilidade.
      secure: env.isProduction, // true em produção (HTTPS), false em desenvolvimento (HTTP)
      maxAge: env.REFRESH_TOKEN_EXPIRATION_MS,
      path: '/', // Garante que o cookie é enviado em todas as rotas
    });

    return res.status(200).json({
      accessToken: tokens.accessToken,
      message: 'Login successful',
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Login failed',
      error: (err as Error).message,
    });
  }
};

// 📥 Registo
const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    return res.status(500).json({
      message: 'Registration failed',
      error: (err as Error).message,
    });
  }
};

// 🔐 Logout
const logout = async (req: Request, res: Response) => {
  try {
    console.log('[authController:logout] Called', {
      cookies: req.cookies,
      headers: req.headers,
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.isProduction,
      path: '/',
    });
    res.clearCookie('XSRF-TOKEN', {
      httpOnly: false,
      sameSite: 'lax',
      secure: env.isProduction,
      path: '/',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({
      message: 'Logout failed',
      error: (err as Error).message,
    });
  }
};

// 🔄 Refresh Token
const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    console.warn('[refreshToken] No refresh token found in cookies. Returning 401.');
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { id: string };

    console.log(`[refreshToken] Refresh token verified for user ID: ${decoded.id}`);

    // Re-issue tokens
    const tokens = await issueTokens(decoded.id, res);

    // Set new XSRF-TOKEN (important: it should be the CSRF token from the csurf middleware, not accessToken)
    // The csrfWithLogging middleware on /api/auth/csrf already sets this.
    // Here, we just ensure the accessToken is returned.
    // If you need to refresh the XSRF-TOKEN cookie here, you must call req.csrfToken()
    // However, the `refreshToken` endpoint is excluded from CSRF checks in app.ts,
    // so req.csrfToken() might not be available here directly, or might not be intended.
    // The XSRF-TOKEN cookie is primarily set by the initial GET /api/auth/csrf request.
    // If it's a new session, the client will fetch it.
    // If the token is being refreshed, the XSRF-TOKEN should ideally persist or be re-issued
    // by a separate mechanism or by the client fetching it again if needed.
    // For now, removing the direct setting of XSRF-TOKEN based on accessToken here,
    // as it seems incorrect. The accessToken is not a CSRF token.
    /*
    res.cookie('XSRF-TOKEN', tokens.accessToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: env.isProduction,
      maxAge: 60 * 60 * 1000,
    });
    */

    console.log('[refreshToken] New access token issued.');
    return res.status(200).json({ accessToken: tokens.accessToken });
  } catch (error) {
    console.error('[refreshToken] Invalid refresh token:', (error as Error).message);
    // Clear the invalid refresh token cookie to prevent continuous attempts with a bad token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax', // Consistent with how it was set
      secure: env.isProduction,
      path: '/',
    });
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// 👤 Obter utilizador atual
const getMe = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    console.warn('[getMe] No user found in request after protection. Returning 401.');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return res.status(200).json({ user });
};

export { logout, register, refreshToken, getMe };
