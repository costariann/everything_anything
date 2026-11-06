'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Package,
  Truck,
  Clock,
  ArrowRight,
  MapPin,
  CreditCard,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { orderService } from '../../../../features/orders/orderService';
import { paymentService } from '../../../../features/payments/paymentService';
import { Order } from '../../../../types';
import { formatPrice } from '../../../../lib/formatters';

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const publicId = params?.publicId as string;
  const paystackRef = searchParams.get('reference') || searchParams.get('trxref');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!publicId) return;
      setLoading(true);
      try {
        const data = await orderService.getOrderByPublicId(publicId);
        if (data) setOrder(data);

        // If redirected from Paystack with a transaction reference, verify with backend
        if (paystackRef && data && data.paymentStatus !== 'PAID') {
          setVerifyingPayment(true);
          try {
            const verifyRes = await paymentService.verifyPaystack(paystackRef);
            if (verifyRes.verified) {
              setPaymentVerified(true);
              // Refresh order data with updated PAID status
              const refreshed = await orderService.getOrderByPublicId(publicId);
              if (refreshed) setOrder(refreshed);
            }
          } catch (vErr) {
            console.error('Paystack verification error:', vErr);
          } finally {
            setVerifyingPayment(false);
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Could not locate order details.');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [publicId, paystackRef]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-900 rounded-full mx-auto mb-4"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-900 rounded-lg w-1/3 mx-auto mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-900 rounded-lg w-1/4 mx-auto"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Order Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{error || 'Unable to retrieve order information.'}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  // Stepper steps for delivery in Ghana
  const steps = [
    { key: 'PENDING', label: 'Order Confirmed', icon: Clock },
    { key: 'PROCESSING', label: 'Processing & Packed', icon: Package },
    { key: 'SHIPPED', label: 'Dispatched to Rider', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
  ];

  const statusIndexMap: Record<string, number> = {
    PENDING: 0,
    PROCESSING: 1,
    SHIPPED: 2,
    DELIVERED: 3,
    CANCELLED: -1,
  };

  const currentStep = statusIndexMap[order.status] ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Paystack Payment Verification Banner */}
      {(paymentVerified || order.paymentStatus === 'PAID') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <span className="font-bold">Payment Confirmed via Paystack: </span>
            <span>Your Mobile Money / Card payment was received successfully. We are now preparing your order for dispatch.</span>
          </div>
        </motion.div>
      )}

      {verifyingPayment && (
        <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-4 flex items-center gap-3 text-indigo-800 dark:text-indigo-300 text-xs animate-pulse">
          <Clock className="w-5 h-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span>Verifying your Paystack payment confirmation...</span>
        </div>
      )}

      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3 relative overflow-hidden shadow-sm"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
          Order Successfully Placed
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Medaase! Thank you for your order!
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Your order has been registered. You will receive updates via SMS / WhatsApp as the dispatch rider heads your way.
        </p>
        <div className="pt-2 font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold">
          Order Number: {order.orderNumber}
        </div>
      </motion.div>

      {/* Live Order Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm"
      >
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">
          Order Status: <span className="text-slate-900 dark:text-white">{order.status}</span>
        </h2>

        {order.status === 'CANCELLED' ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
            This order has been cancelled.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={step.key}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                    isCurrent
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-600'
                      : isCompleted
                      ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 mb-2 ${
                      isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isCurrent
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  />
                  <span className="text-xs font-semibold block text-slate-900 dark:text-white">{step.label}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">
                    {isCompleted ? 'Complete' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Order Details & Delivery Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ordered Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-200 dark:border-slate-800">
            Items Ordered ({order.items.length})
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {order.items.map((item) => (
              <div key={item.publicId} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{item.productName}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.variantName} • Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                  </div>
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatPrice(item.totalPrice)}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="text-slate-900 dark:text-white font-medium">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Dispatch Delivery</span>
              <span className="text-slate-900 dark:text-white">
                {order.shippingFee === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 uppercase font-bold">Free</span>
                ) : (
                  formatPrice(order.shippingFee)
                )}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
              <span>Total Amount</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Customer & Delivery Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Delivery Location (Ghana)</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1 leading-relaxed">
              <div className="font-bold text-slate-900 dark:text-white">{order.shippingAddress.fullName}</div>
              <div>{order.shippingAddress.addressLine1}</div>
              {order.shippingAddress.digitalAddress && (
                <div className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">
                  GPS: {order.shippingAddress.digitalAddress}
                </div>
              )}
              <div>
                {order.shippingAddress.city}, {order.shippingAddress.region || order.shippingAddress.state} Region
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">{order.shippingAddress.country || 'Ghana'}</div>
              <div className="text-slate-500 dark:text-slate-400 pt-1">
                Phone: <strong>{order.shippingAddress.phone}</strong>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 text-xs shadow-sm">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Payment Details</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Method:</span>
              <span className="text-slate-900 dark:text-white font-medium">
                {order.paymentMethod === 'PAYSTACK'
                  ? 'Paystack (MoMo / Card)'
                  : order.paymentMethod === 'PAY_ON_DELIVERY' || order.paymentMethod === 'CASH_ON_DELIVERY'
                  ? 'Pay on Delivery'
                  : order.paymentMethod.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Status:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                }`}
              >
                {order.paymentStatus === 'PAID' ? 'PAID' : 'PENDING PAYMENT'}
              </span>
            </div>
          </div>

          <Link
            href="/products"
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 text-xs font-semibold rounded-xl text-center transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
