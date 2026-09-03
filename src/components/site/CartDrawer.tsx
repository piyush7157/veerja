import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { inr } from "@/lib/shop-data";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    setQuantity,
    removeItem,
    subtotal,
    delivery,
    total,
    openCheckout,
  } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-60 bg-brown/45 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed top-0 right-0 z-70 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-warm-lg"
            aria-label="Shopping cart"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4">
              <h2 className="min-w-0 truncate font-display text-xl font-semibold text-brown">
                Your Cart
              </h2>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-brown hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-gold/12 text-gold-deep">
                    <ShoppingBag className="h-7 w-7" />
                  </span>
                  <p className="mt-4 font-display text-lg text-brown">Your cart is empty</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add a jar of golden goodness to get started.
                  </p>
                  <Button onClick={closeCart} variant="outline" className="mt-5">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.key}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-3 rounded-2xl border border-border bg-card p-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          width={80}
                          height={80}
                          className="h-20 w-20 shrink-0 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-brown">{item.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{item.sizeLabel}</p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 rounded-lg border border-border">
                              <button
                                aria-label="Decrease quantity"
                                onClick={() => setQuantity(item.key, item.quantity - 1)}
                                className="grid h-7 w-7 place-items-center rounded-md text-brown hover:bg-secondary"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                aria-label="Increase quantity"
                                onClick={() => setQuantity(item.key, item.quantity + 1)}
                                className="grid h-7 w-7 place-items-center rounded-md text-brown hover:bg-secondary"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-brown">
                              {inr(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                        <button
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.key)}
                          className="self-start text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border bg-card px-5 py-4">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Subtotal</dt>
                    <dd>{inr(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Delivery</dt>
                    <dd className="text-leaf">{delivery === 0 ? "Free" : inr(delivery)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-brown">
                    <dt>Total</dt>
                    <dd>{inr(total)}</dd>
                  </div>
                </dl>
                <Button
                  size="lg"
                  onClick={openCheckout}
                  className="mt-4 w-full bg-gradient-to-r from-gold to-gold-deep text-primary-foreground shadow-warm hover:opacity-95"
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
