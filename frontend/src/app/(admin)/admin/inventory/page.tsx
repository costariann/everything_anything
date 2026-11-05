'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Save } from 'lucide-react';
import { adminService } from '../../../../features/admin/adminService';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [savedSuccessMap, setSavedSuccessMap] = useState<Record<string, boolean>>({});

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await adminService.getInventory();
      if (data) {
        setItems(data);
        const map: Record<string, number> = {};
        data.forEach((item: any) => {
          map[item.publicId] = item.stockQuantity;
        });
        setStockInputs(map);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockSave = async (publicId: string) => {
    const qty = stockInputs[publicId];
    if (qty === undefined || qty < 0) return;

    setSavingMap((prev) => ({ ...prev, [publicId]: true }));
    try {
      await adminService.updateInventoryStock(publicId, qty);
      setSavedSuccessMap((prev) => ({ ...prev, [publicId]: true }));
      setTimeout(() => {
        setSavedSuccessMap((prev) => ({ ...prev, [publicId]: false }));
      }, 2000);
      loadInventory();
    } catch (err) {
      console.error('Failed to update stock:', err);
    } finally {
      setSavingMap((prev) => ({ ...prev, [publicId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Inventory & Stock Tracking</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor SKU inventory levels, replenish warehouse stock, and avoid out-of-stock bottlenecks.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading stock records...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No variant inventory records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product & Variant</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {items.map((item) => (
                  <tr key={item.publicId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.sku}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{item.productName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{item.name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                        {item.stockQuantity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isOutOfStock ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                          Out of Stock
                        </span>
                      ) : item.isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" /> Low Stock ({item.stockQuantity})
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                          Adequate
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={stockInputs[item.publicId] ?? item.stockQuantity}
                          onChange={(e) =>
                            setStockInputs({
                              ...stockInputs,
                              [item.publicId]: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="w-20 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-mono text-center focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleStockSave(item.publicId)}
                          disabled={savingMap[item.publicId]}
                          className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center justify-center ${
                            savedSuccessMap[item.publicId]
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-sm'
                          }`}
                          title="Save stock level"
                        >
                          {savedSuccessMap[item.publicId] ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
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
