// tests/setup/jest.setup.ts
import { jest } from '@jest/globals';

jest.mock('passport', () => {
  const fake = {
    initialize: jest.fn(() => (_req: any, _res: any, next: any) => next()),
    session: jest.fn(() => (_req: any, _res: any, next: any) => next()),

    serializeUser: jest.fn().mockImplementation((...args: any[]) => {
      const done = args[1];
      if (typeof done === 'function') done(null, args[0]?.id || 'mock-id');
    }),

    deserializeUser: jest.fn().mockImplementation((...args: any[]) => {
      const done = args[1];
      if (typeof done === 'function') done(null, { id: args[0] });
    }),

    authenticate: jest.fn((strategy: string) => (_req: any, res: any) => {
      res.cookie('refreshToken', `mock-${strategy}-token`, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
      });
      res.redirect('http://localhost:5173');
    }),

    use: jest.fn(),
  };

  return fake;
});
