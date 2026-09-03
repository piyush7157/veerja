import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { DELIVERY_FEE } from "./shop-data";

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  sizeId: string;
  sizeLabel: string;
  price: number;
  quantity: number;
  image: string;
};

export type PlacedOrder = {
  orderNumber: string;
  customerName: string;
  total: number;
  items: CartItem[];
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  delivery: number;
  total: number;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  order: PlacedOrder | null;
  addItem: (item: Omit<CartItem, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  placeOrder: (customerName: string, orderNumber?: string) => PlacedOrder;
  dismissOrder: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  const addItem = useCallback((item: Omit<CartItem, "key">) => {
    const key = `${item.productId}-${item.sizeId}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      return [...prev, { ...item, key }];
    });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, quantity } : i)),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const delivery = items.length ? DELIVERY_FEE : 0;
    return {
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      delivery,
      total: subtotal + delivery,
      isCartOpen,
      isCheckoutOpen,
      order,
      addItem,
      setQuantity,
      removeItem,
      clear: () => setItems([]),
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      openCheckout: () => {
        setCartOpen(false);
        setCheckoutOpen(true);
      },
      closeCheckout: () => setCheckoutOpen(false),
      placeOrder: (customerName: string, confirmedOrderNumber?: string) => {
        const placed: PlacedOrder = {
          orderNumber: confirmedOrderNumber ?? `VE${Date.now().toString().slice(-8)}`,
          customerName,
          total: subtotal + delivery,
          items,
        };
        setOrder(placed);
        setItems([]);
        setCheckoutOpen(false);
        return placed;
      },
      dismissOrder: () => setOrder(null),
    };
  }, [items, isCartOpen, isCheckoutOpen, order, addItem, setQuantity, removeItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
