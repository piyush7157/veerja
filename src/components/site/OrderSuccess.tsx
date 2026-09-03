import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { inr } from "@/lib/shop-data";

const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i % 9) * 12 - 48,
  delay: (i % 6) * 0.08,
  rotate: i * 37,
}));

export function OrderSuccess() {
  const { order, dismissOrder } = useCart();

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-90 flex items-center justify-center overflow-y-auto bg-brown/55 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 240 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gold/30 bg-background p-7 text-center shadow-warm-lg sm:p-9"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden">
              {CONFETTI.map((c) => (
                <motion.span
                  key={c.id}
                  initial={{ opacity: 0, y: -20, x: c.x, rotate: 0 }}
                  animate={{ opacity: [0, 1, 0], y: 180, rotate: c.rotate }}
                  transition={{ duration: 2.2, delay: c.delay, ease: "easeOut" }}
                  className="absolute left-1/2 h-2.5 w-1.5 rounded-full bg-gold"
                />
              ))}
            </div>

            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 220, delay: 0.1 }}
              className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-primary-foreground shadow-warm"
            >
              <Check className="h-9 w-9" strokeWidth={3} />
            </motion.span>

            <h2 className="mt-6 font-display text-2xl font-semibold text-brown sm:text-3xl">
              Thank You for Choosing Veerja Eats! 💛
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your order has been successfully placed. We're preparing your golden goodness with
              care.
            </p>

            <dl className="mt-6 space-y-2 rounded-2xl border border-border bg-beige/60 p-4 text-left text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Order number</dt>
                <dd className="font-semibold text-brown">{order.orderNumber}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Customer</dt>
                <dd className="min-w-0 truncate font-medium text-brown">{order.customerName}</dd>
              </div>
              <div className="border-t border-border pt-2">
                <dt className="text-muted-foreground">Products</dt>
                <dd className="mt-1 space-y-1">
                  {order.items.map((i) => (
                    <span key={i.key} className="block text-brown">
                      {i.name} — {i.sizeLabel} × {i.quantity}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-border pt-2">
                <dt className="text-muted-foreground">Total amount</dt>
                <dd className="font-display text-lg font-semibold text-brown">
                  {inr(order.total)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={dismissOrder}
                className="flex-1 bg-gradient-to-r from-gold to-gold-deep text-primary-foreground shadow-warm hover:opacity-95"
              >
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                onClick={dismissOrder}
                className="flex-1 border-brown/25 text-brown"
                asChild
              >
                <a href="#contact">View Order</a>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
