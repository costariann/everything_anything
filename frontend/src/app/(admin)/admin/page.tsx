'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { adminService } from '../../../features/admin/adminService';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await adminService.getDashboardStats();
        if (data) setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockVariants: 0,
  };

  const cards = [
    {
      label: 'Total Revenue',
      value: `$${metrics.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
      description: 'Paid orders total',
    },
    {
      label: 'Total Orders',
      value: metrics.totalOrders,
      icon: ShoppingCart,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
      description: 'Customer & guest purchases',
    },
    {
      label: 'Active Products',
      value: metrics.totalProducts,
      icon: Package,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20',
      description: 'Catalogue active items',
    },
    {
      label: 'Registered Customers',
      value: metrics.totalCustomers,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
      description: 'Authenticated accounts',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time business performance, inventory alerts, and order pipeline.
          </p>
        </div>

        {metrics.lowStockVariants > 0 && (
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{metrics.lowStockVariants} variant(s) low on stock</span>
          </Link>
        )}
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{card.value}</div>
                <div className="text-[11px] text-slate-500 mt-1">{card.description}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders Overview */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Recent Orders</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest customer transactions</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Manage All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentOrders?.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No orders placed yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {stats?.recentOrders?.map((order: any) => (
              <div
                key={order.publicId}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{order.orderNumber}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                          : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Customer: <span className="text-slate-700 dark:text-slate-200">{order.customer}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">${order.totalAmount.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Link
                    href={`/orders/${order.publicId}`}
                    target="_blank"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
