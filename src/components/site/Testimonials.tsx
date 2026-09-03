import { Quote, Star } from "lucide-react";

import { TESTIMONIALS } from "@/lib/shop-data";
import { SectionHeading } from "./Reveal";

export function Testimonials() {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section id="reviews" className="overflow-hidden py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Reviews"
          title="Loved by Our Customers"
          subtitle="Thousands of Indian kitchens have already made the switch."
        />
      </div>

      <div className="group relative mt-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max gap-4 [animation:marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]">
          {loop.map((t, i) => (
            <article
              key={`${t.name}-${i}`}
              className="w-[19rem] shrink-0 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-warm sm:w-[22rem]"
            >
              <Quote className="h-6 w-6 text-gold/60" />
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">"{t.review}"</p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-base font-semibold text-gold-deep">
                  {t.name.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-brown">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.city}</span>
                </span>
                <span className="ml-auto flex shrink-0 text-gold">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
