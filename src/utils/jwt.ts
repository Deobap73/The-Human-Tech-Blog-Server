// The-Human-Tech-Blog-Server/src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const signAccessToken = (userId: string) => {
  // O operador '!' afirma ao TypeScript que estas variáveis não serão 'undefined' em tempo de execução.
  // Para 'expiresIn', usamos 'as jwt.SignOptions['expiresIn']' para uma asserção de tipo explícita,
  // garantindo que a string de expiração (e.g., "1h", "7d") seja compatível com a tipagem da biblioteca.
  return jwt.sign(
    { id: userId },
    env.JWT_SECRET!, // Garante que a chave secreta é uma string e não undefined
    {
      expiresIn: env.JWT_EXPIRATION as jwt.SignOptions['expiresIn'], // Asserção de tipo mais precisa para expiresIn
    }
  );
};

export const signRefreshToken = (userId: string) => {
  // Aplicamos a mesma lógica para o refresh token.
  return jwt.sign(
    { id: userId },
    env.REFRESH_TOKEN_SECRET!, // Garante que a chave secreta é uma string e não undefined
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRATION as jwt.SignOptions['expiresIn'], // Asserção de tipo mais precisa para expiresIn
    }
  );
};

export const verifyRefreshToken = (token: string) => {
  // Para a verificação, também afirmamos que o segredo não será undefined.
  // O tipo de retorno é explicitamente definido para garantir que TS saiba a estrutura.
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET!) as { id: string };
};
