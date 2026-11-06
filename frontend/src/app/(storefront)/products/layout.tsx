import React from 'react';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'Shop All Products — Electronics, Fashion & Home Craft',
  description:
    'Browse the complete everythinganything product catalogue. Filter by category, brand, or price and enjoy fast guest checkout with express delivery across Ghana.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: `Product Catalogue | ${SITE_NAME}`,
    description:
      'Discover curated electronics, fashion, and artisanal home craft with instant guest checkout.',
    url: `${SITE_URL}/products`,
    type: 'website',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

