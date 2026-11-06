import type { MetadataRoute } from 'next';
import { SITE_NAME, SITE_DESCRIPTION } from '../lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Online Store`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/favicon.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '256x256',
        type: 'image/png',
      },
    ],
  };
}

