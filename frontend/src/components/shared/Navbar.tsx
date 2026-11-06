'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Shield,
  Menu,
  X,
  Home,
  Package,
  Grid,
  Award,
  ChevronDown,
  LogOut,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { formatPrice } from '../../lib/formatters';

const NAV_LINKS = [
  { href: '/', label: 'Home', subtitle: 'Featured & deals', icon: Home, exact: true },
  { href: '/products', label: 'Products', subtitle: 'Full catalogue', icon: Package, exact: false },
  { href: '/categories', label: 'Categories', subtitle: 'By department', icon: Grid, exact: false },
  { href: '/brands', label: 'Brands', subtitle: 'Official makers', icon: Award, exact: false },
];

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const getItemCount = useCartStore((s) => s.getItemCount);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close desktop user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cartCount = mounted ? getItemCount() : 0;
  const cartSubtotal = mounted ? getSubtotal() : 0;

  const isActiveLink = (href: string, exact: boolean) => {
    if (!pathname) return false;
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
    }
  };

  const userInitials =
    mounted && user?.fullName
      ? user.fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'U';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Left: Brand Logo */}
            <div className="flex items-center gap-4 lg:gap-6 min-w-0">
              <Link href="/" className="flex items-center gap-2.5 group min-w-0">
                <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm shadow-indigo-600/25 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center bg-indigo-600 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src="/logo.png"
                    alt="everythinganything Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
                  everything<span className="text-indigo-600 dark:text-indigo-400">anything</span>
                </span>
              </Link>

              {/* Desktop Navigation Pill Bar */}
              <nav
                aria-label="Main Navigation"
                className="hidden md:flex items-center gap-1 p-1 rounded-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800/80"
              >
                {NAV_LINKS.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveLink(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        active
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          active ? 'scale-105' : 'opacity-75'
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Center: Desktop Search Bar */}
            <div className="hidden lg:block flex-1 max-w-sm xl:max-w-md mx-2">
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-full pl-9 pr-16 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                {searchQuery.trim() && (
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold transition-colors"
                  >
                    Go
                  </button>
                )}
              </form>
            </div>

            {/* Right Actions (Desktop vs Mobile cleanly separated) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Search Toggle for Tablet/Mobile (< lg) */}
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen((prev) => !prev);
                  setMobileMenuOpen(false);
                }}
                aria-label="Toggle Search"
                className={`lg:hidden p-2 rounded-xl border transition-colors ${
                  mobileSearchOpen
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-100/80 dark:bg-slate-900/80 border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Desktop-Only Controls (Theme + User Dropdown) */}
              <div className="hidden md:flex items-center gap-2.5">
                <ThemeToggle />

                {mounted && user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen((prev) => !prev)}
                      className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 transition-all"
                    >
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                        {userInitials}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[96px] truncate">
                        {user.fullName.split(' ')[0]}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                          userMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/40 py-2 z-50 overflow-hidden"
                        >
                          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {user.fullName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {user.email}
                            </p>
                          </div>

                          <div className="p-1.5 space-y-0.5">
                            <Link
                              href="/account"
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <UserIcon className="w-4 h-4 text-indigo-500" />
                              My Account & Orders
                            </Link>

                            {user.role === 'ADMIN' && (
                              <Link
                                href="/admin"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-colors"
                              >
                                <Shield className="w-4 h-4" />
                                Admin Portal
                              </Link>
                            )}
                          </div>

                          <div className="border-t border-slate-100 dark:border-slate-800/80 mt-1 pt-1 px-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setUserMenuOpen(false);
                                logout();
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/25 transition-all"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button (< md) */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen((prev) => !prev);
                  setMobileSearchOpen(false);
                }}
                aria-label="Toggle Menu"
                className={`md:hidden relative flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                  mobileMenuOpen
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-slate-100/80 dark:bg-slate-900/80 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                <span>Menu</span>
                {mounted && user && !mobileMenuOpen && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Search Bar Dropdown for Mobile / Tablet (< lg) */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="lg:hidden overflow-hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950"
            >
              <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
                <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search products, brands, categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex-shrink-0"
                  >
                    Search
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Creative Mobile Menu Drawer (< md) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 pt-4 pb-6 space-y-5 shadow-2xl"
            >
              {/* 2x2 Visual Navigation Grid */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 px-1">
                  Explore Storefront
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {NAV_LINKS.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveLink(item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-start gap-2.5 p-3 rounded-2xl border transition-all ${
                          active
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/25'
                            : 'bg-slate-50 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-500/40'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{item.label}</div>
                          <div
                            className={`text-[10px] truncate ${
                              active ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {item.subtitle}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Account / Auth Card */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-3.5">
                {mounted && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {userInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {user.fullName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors flex-shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                        My Account
                      </Link>
                      {user.role === 'ADMIN' ? (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Admin Portal
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            openDrawer();
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Cart ({cartCount})
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        Member Benefits
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Track orders & save delivery details
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                      >
                        Join
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Appearance / Theme Row */}
              <div className="flex items-center justify-between pt-1 px-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Theme Preference
                </span>
                <ThemeToggle />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Floating Shopping Bag Action Button (Bottom-Right) */}
      <AnimatePresence>
        {!isDrawerOpen && (
          <motion.button
            type="button"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={openDrawer}
            aria-label="Open Shopping Bag"
            className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 group flex items-center gap-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 sm:px-4 sm:py-3 shadow-xl shadow-indigo-600/35 border border-indigo-400/30 backdrop-blur-md transition-colors"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
              {mounted && cartCount > 0 && (
                <span className="sm:hidden absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-indigo-600 text-[10px] font-black flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </div>

            {mounted && cartCount > 0 ? (
              <div className="hidden sm:flex items-center gap-2 pr-0.5">
                <div className="text-left leading-tight">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-indigo-200">
                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="block text-xs font-extrabold text-white">
                    {formatPrice(cartSubtotal)}
                  </span>
                </div>
                <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ) : (
              <span className="hidden sm:inline text-xs font-bold pr-1">Bag</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};
