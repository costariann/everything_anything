'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Tag } from 'lucide-react';
import { Banner } from '../../types';

interface PromoBannerProps {
  banner?: Banner | null;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ banner }) => {
  if (!banner) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl min-h-[300px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 sm:p-12 max-w-xl space-y-4">
          {banner.badgeText && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Tag className="w-3.5 h-3.5" />
              <span>{banner.badgeText}</span>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {banner.title}
          </h2>

          {banner.subtitle && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {banner.subtitle}
            </p>
          )}

          <div className="pt-2">
            <Link
              href={banner.ctaLink || '/products'}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-600/30 group"
            >
              <span>{banner.ctaText || 'Claim Offer'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

