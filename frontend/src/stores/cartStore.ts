import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (variantPublicId: string) => void;
  updateQuantity: (variantPublicId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      addItem: (item) => {
        const qtyToAdd = item.quantity || 1;
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.variantPublicId === item.variantPublicId
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            const currentItem = updated[existingIndex];
            const newQty = Math.min(currentItem.quantity + qtyToAdd, item.maxStock);
            updated[existingIndex] = { ...currentItem, quantity: newQty };
            return { items: updated, isDrawerOpen: true };
          } else {
            return {
              items: [...state.items, { ...item, quantity: Math.min(qtyToAdd, item.maxStock) }],
              isDrawerOpen: true,
            };
          }
        });
      },

      removeItem: (variantPublicId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantPublicId !== variantPublicId),
        }));
      },

      updateQuantity: (variantPublicId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.variantPublicId !== variantPublicId),
            };
          }
          return {
            items: state.items.map((i) => {
              if (i.variantPublicId === variantPublicId) {
                return { ...i, quantity: Math.min(quantity, i.maxStock) };
              }
              return i;
            }),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'everythinganything_cart',
    }
  )
);

