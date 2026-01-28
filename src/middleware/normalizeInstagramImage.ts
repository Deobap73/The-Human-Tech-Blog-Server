// ./src/middleware/normalizeInstagramImage.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para normalizar o campo instagramImage para ser apenas string
 * - Se for objeto, extrai a propriedade 'url'
 * - Se for outro tipo, converte para string vazia
 * - Remove campos como publicId, displayName, folder, updatedAt
 */
export function normalizeInstagramImage(req: Request, _res: Response, next: NextFunction) {
  if (req.body.instagramImage !== undefined) {
    const instagramImage = req.body.instagramImage;

    if (instagramImage === null || instagramImage === '') {
      // Se for null ou string vazia, definir como undefined para remover do banco
      req.body.instagramImage = undefined;
    } else if (typeof instagramImage === 'string') {
      // Já é string, manter como está
      req.body.instagramImage = instagramImage.trim();
    } else if (typeof instagramImage === 'object' && instagramImage !== null) {
      // Se for objeto, extrair apenas a URL
      const url = instagramImage.url || instagramImage.imageUrl || '';
      req.body.instagramImage = url.trim();
    } else {
      // Qualquer outro tipo (number, boolean, etc.) converter para string vazia
      req.body.instagramImage = '';
    }

    console.log('[normalizeInstagramImage] Normalized:', {
      original: instagramImage,
      normalized: req.body.instagramImage,
    });
  }

  next();
}
