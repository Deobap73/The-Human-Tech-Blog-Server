// src/i18n/index.ts

import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import path from 'path';

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'pt', 'de', 'es'],
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/translation.json'),
    },
    detection: {
      order: ['path', 'header'],
      lookupPath: 'lang',
      lookupHeader: 'accept-language',
    },
    saveMissing: false,
    supportedLngs: ['en', 'pt', 'de', 'es'],
  });

export default i18next;
export { i18nextMiddleware };
