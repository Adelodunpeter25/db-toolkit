export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://dbtoolkit.vercel.app/sitemap.xml',
  };
}
