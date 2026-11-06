import React from 'react';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'Product Categories — Shop by Department',
  description:
    'Explore everythinganything collections by category, from personal electronics and smart gadgets to contemporary fashion and home decor.',
  alternates: {
    canonical: '/categories',
  },
  openGraph: {
    title: `Shop by Category | ${SITE_NAME}`,
    description:
      'Browse curated departments across electronics, fashion, accessories, and home craft.',
    url: `${SITE_URL}/categories`,
    type: 'website',
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

