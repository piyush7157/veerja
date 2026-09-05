import { useMemo, useState } from "react";
import { BadgeCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { inr } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import gheeJar from "@/assets/ghee-jar.jpg";
import { Reveal, SectionHeading } from "./Reveal";

type Variant = {
  id: string;
  label: string;
  price: number;
  mrp: number;
  stock: number;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  image_url: string | null;
  product_variants: Variant[];
};

type SortKey = "featured" | "price-asc" | "price-desc" | "discount";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Popularity" },
  { id: "price-asc", label: "Price — low to high" },
  { id: "price-desc", label: "Price — high to low" },
  { id: "discount", label: "Biggest discount" },
];

const discountOf = (variant: Variant) =>
  variant.mrp > variant.price ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100) : 0;

export function ProductCatalog({ products }: { products: CatalogProduct[] }) {
  const [sort, setSort] = useState<SortKey>("featured");

  const sorted = useMemo(() => {
    const list = [...products];
    const best = (product: CatalogProduct) => product.product_variants[0]!;
    if (sort === "price-asc") list.sort((a, b) => best(a).price - best(b).price);
    if (sort === "price-desc") list.sort((a, b) => best(b).price - best(a).price);
    if (sort === "discount") list.sort((a, b) => discountOf(best(b)) - discountOf(best(a)));
    return list;
  }, [products, sort]);

  return (
    <section id="our-ghee" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <SectionHeading
        eyebrow="Shop A2 Ghee"
        title="Our Golden Goodness"
        subtitle="Pick your pack size, check the savings, and add it straight to your cart."
      />

      <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-border py-3">
        <span className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Sort by
        </span>
        {SORTS.map((option) => (
          <button
            key={option.id}
            onClick={() => setSort(option.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              sort === option.id
                ? "bg-gold/15 text-brown"
                : "text-muted-foreground hover:text-brown",
            )}
          >
            {option.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "product" : "products"}
        </span>
      </div>

      <Reveal className="mt-8">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function ProductCard({ product }: { product: CatalogProduct }) {
  const { addItem, openCart, openCheckout } = useCart();
  const [variantId, setVariantId] = useState(product.product_variants[0]!.id);
  const variant =
    product.product_variants.find((item) => item.id === variantId) ?? product.product_variants[0]!;
  const discount = discountOf(variant);
  const image = product.image_url ?? gheeJar;
  const outOfStock = variant.stock <= 0;

  const add = () => {
    addItem({
      productId: product.id,
      name: product.name,
      sizeId: variant.id,
      sizeLabel: variant.label,
      price: variant.price,
      quantity: 1,
      image,
    });
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-warm transition-shadow hover:shadow-warm-lg">
      <div className="relative overflow-hidden bg-beige p-3">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="mx-auto h-56 w-full object-contain transition-transform duration-700 hover:scale-105"
        />

        {discount > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-leaf px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            {discount}% off
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 grid place-items-center bg-brown/55 text-sm font-semibold text-cream">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-leaf/12 px-1.5 py-0.5 text-xs font-semibold text-leaf">
            4.9 <Star className="h-3 w-3 fill-current" />
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5 text-gold-deep" /> Lab tested purity
          </span>
        </div>

        <h3 className="mt-2 font-display text-xl font-semibold text-brown">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {product.product_variants.map((item) => (
            <button
              key={item.id}
              onClick={() => setVariantId(item.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                item.id === variant.id
                  ? "border-gold bg-gold/12 text-brown"
                  : "border-border bg-background text-foreground/70 hover:border-gold/50",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <span className="font-display text-3xl font-semibold text-brown">{inr(variant.price)}</span>
          {variant.mrp > variant.price && (
            <>
              <span className="text-sm text-muted-foreground line-through">{inr(variant.mrp)}</span>
              <span className="text-xs font-semibold text-leaf">
                Save {inr(variant.mrp - variant.price)}
              </span>
            </>
          )}
        </div>

        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Truck className="h-4 w-4 text-leaf" /> Free delivery across India
          {!outOfStock && variant.stock <= 10 && (
            <span className="ml-1 font-semibold text-destructive">Only {variant.stock} left</span>
          )}
        </p>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <Button
            disabled={outOfStock}
            onClick={() => {
              add();
              openCart();
              toast.success("Added to your cart", {
                description: `1 × ${product.short_name} (${variant.label})`,
              });
            }}
            className="flex-1 bg-gradient-to-r from-gold to-gold-deep text-primary-foreground shadow-warm hover:opacity-95"
          >
            <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
          <Button
            variant="outline"
            disabled={outOfStock}
            onClick={() => {
              add();
              openCheckout();
            }}
            className="flex-1 border-brown/25 bg-brown text-primary-foreground hover:bg-brown/90"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </article>
  );
}
