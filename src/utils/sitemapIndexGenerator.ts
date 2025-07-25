export const generateSitemapIndexXml = (): string => {
  const baseUrl = 'https://thehumantechblog.com';
  const today = new Date().toISOString().split('T')[0];

  const sitemapFiles = [
    'sitemap-posts.xml',
    'sitemap-quickposts.xml',
    'sitemap-prompts.xml',
    'sitemap-categories.xml',
    'sitemap-static.xml',
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapFiles
      .map((file) => {
        return `  <sitemap>
    <loc>${baseUrl}/${file}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
      })
      .join('\n') +
    `\n</sitemapindex>`;

  return xml;
};
