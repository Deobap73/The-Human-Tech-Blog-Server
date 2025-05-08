// The-Human-Tech-Blog-Server/jest.config.js

require('dotenv').config({ path: './.env.test' });

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
};
