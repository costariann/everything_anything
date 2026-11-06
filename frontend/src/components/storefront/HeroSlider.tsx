'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Banner } from '../../types';

interface HeroSliderProps {
  slides?: Banner[];
}

const defaultSlides: Banner[] = [
  {
    publicId: 'default-1',
    title: 'Everything You Desire, Handcrafted & Curated',
    subtitle: 'Explore premium noise-canceling acoustics, sustainable organic apparel, and Scandinavian workspace designs.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    badgeText: 'Curated E-Commerce Platform',
    ctaText: 'Explore Catalogue',
    ctaLink: '/products',
    position: 'HERO_SLIDE',
    displayOrder: 0,
  },
  {
    publicId: 'default-2',
    title: 'Sustainable Daily Luxury & Comfort',
    subtitle: '100% GOTS-certified organic cotton hoodies, knitwear, and minimalist essentials engineered for lasting comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
    badgeText: 'Autumn Collection',
    ctaText: 'Explore Apparel',
    ctaLink: '/products?category=fashion',
    position: 'HERO_SLIDE',
    displayOrder: 1,
  },
];

export const HeroSlider: React.FC<HeroSliderProps> = ({ slides = [] }) => {
  const activeSlides = slides.length > 0 ? slides : defaultSlides;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, activeSlides.length]);

  const currentSlide = activeSlides[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-slate-900 border-b border-slate-200 dark:border-slate-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] flex items-center">
        {/* Animated Background Slider */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentSlide.publicId}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            className="absolute inset-0 z-0"
          >
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              className="w-full h-full object-cover"
            />
            {/* Rich gradient overlays for accessibility in both light and dark modes */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          </motion.div>
        </AnimatePresence>

        {/* Slide Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`badge-${currentSlide.publicId}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/40 backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentSlide.badgeText || 'Special Highlight'}</span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${currentSlide.publicId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md"
              >
                {currentSlide.title}
              </motion.h1>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${currentSlide.publicId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm sm:text-base text-slate-200/90 max-w-xl leading-relaxed drop-shadow"
              >
                {currentSlide.subtitle}
              </motion.p>
            </AnimatePresence>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <Link
                href={currentSlide.ctaLink || '/products'}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-xl shadow-indigo-600/40 flex items-center gap-2 group"
              >
                <span>{currentSlide.ctaText || 'Shop Collection'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/categories"
                className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-sm rounded-xl transition-colors backdrop-blur-md"
              >
                Browse Categories
              </Link>
            </motion.div>

            {/* Value Guarantees */}
            <div className="flex items-center gap-6 pt-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mandatory Guest Checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Free Delivery in Ghana over GH₵ 500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-slate-700 text-white flex items-center justify-center transition-all backdrop-blur-md"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-slate-700 text-white flex items-center justify-center transition-all backdrop-blur-md"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slide Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-8 bg-indigo-500'
                      : 'w-2 bg-slate-400/50 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

