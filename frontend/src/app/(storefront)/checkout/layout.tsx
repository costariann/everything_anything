import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Guest Checkout',
  description: 'Complete your order securely with Mobile Money or Card via Paystack.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

