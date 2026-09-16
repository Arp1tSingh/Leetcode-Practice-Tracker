import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://leetcode-fsrs.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/privacy', '/terms', '/thank-you'],
        disallow: ['/api/', '/problems', '/patterns', '/reviews', '/review/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
