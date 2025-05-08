// tests/helpers/cookie.ts

/**
 * Extrai um cookie específico de um array de cookies set-cookie.
 *
 * @param cookies Cabeçalhos set-cookie da resposta HTTP
 * @param name Nome do cookie a extrair (ex: 'refreshToken')
 * @returns O valor completo do cookie correspondente ou string vazia
 */
export function extractCookie(cookies: string[] | undefined, key: string): string | null {
  if (!Array.isArray(cookies)) return null;
  const cookie = cookies.find((c) => c.startsWith(`${key}=`));
  return cookie ?? null;
}
