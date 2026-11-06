import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 mt-20 transition-colors duration-200">
      {/* Guarantees Banner */}
      <div className="border-b border-slate-200 dark:border-slate-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 border border-indigo-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Free Express Delivery</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across Ghana on orders over GH₵ 500</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Guest Checkout</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Purchase quickly with no account</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 border border-sky-500/20">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">30-Day Easy Returns</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Hassle-free money back guarantee</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 border border-purple-500/20">
              <Headphones className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Dedicated Support</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">24/7 assistance on your orders</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-indigo-600 flex items-center justify-center shadow-sm border border-slate-200/80 dark:border-slate-800 flex-shrink-0">
              <img
                src="/logo.png"
                alt="everythinganything Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-base">
              everything<span className="text-indigo-600 dark:text-indigo-400">anything</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your premier multi-category destination for curated electronics, apparel, home craft, and wellness essentials.
          </p>
        </div>

        <div>
          <h5 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Shop</h5>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/products" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Categories
              </Link>
            </li>
            <li>
              <Link href="/brands" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Brands
              </Link>
            </li>
            <li>
              <Link href="/products?featured=true" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Featured Highlights
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Customer Care</h5>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/cart" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                View Cart
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Guest Checkout
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Order Tracking
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Administration</h5>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Admin Sign In
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Management Dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} everythinganything. All rights reserved.
      </div>
    </footer>
  );
};
