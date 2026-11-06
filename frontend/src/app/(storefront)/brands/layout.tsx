import React from 'react';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'Official Brands & Makers',
  description:
    'Shop authentic products from trusted global and local brands in technology, fashion, and artisanal home craft on everythinganything.',
  alternates: {
    canonical: '/brands',
  },
  openGraph: {
    title: `Featured Brands | ${SITE_NAME}`,
    description:
      'Discover official brands and manufacturers available with express delivery across Ghana.',
    url: `${SITE_URL}/brands`,
    type: 'website',
  },
};

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

