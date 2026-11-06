'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { orderService } from '../../../../features/orders/orderService';
import { formatPrice } from '../../../../lib/formatters';

const statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAdminOrders({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      });
      if (data) setOrders(data);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const handleStatusChange = async (publicId: string, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(publicId, newStatus);
      loadOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Orders Processing</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fulfill guest and registered customer orders, dispatch packages and update tracking.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl text-xs overflow-x-auto shadow-sm">
          {['ALL', ...statusOptions].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                selectedStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No orders found for this status.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Placed Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {orders.map((o) => (
                  <tr key={o.publicId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-200">{o.customerName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{o.customerEmail}</div>
                      {o.isGuest && (
                        <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                          Guest Order
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono">{o.itemCount} item(s)</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          o.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.publicId, e.target.value)}
                        className={`bg-white dark:bg-slate-950 border rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none transition-colors ${
                          o.status === 'DELIVERED'
                            ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                            : o.status === 'CANCELLED'
                            ? 'border-rose-500/40 text-rose-700 dark:text-rose-400'
                            : 'border-indigo-500/40 text-indigo-700 dark:text-indigo-400'
                        }`}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/orders/${o.publicId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View order tracking receipt"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
