import { BENEFITS } from "@/lib/shop-data";
import { Reveal } from "./Reveal";

export function Benefits() {
  return (
    <section className="border-y border-border bg-beige/70">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:grid-cols-5 lg:py-10">
        {BENEFITS.map((b, i) => (
          <Reveal key={b.title} delay={i * 0.08}>
            <div className="group flex h-full min-w-0 items-center gap-3 rounded-2xl border border-transparent bg-card/60 px-3.5 py-4 transition-all hover:-translate-y-1 hover:border-gold/30 hover:bg-card hover:shadow-warm">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/15 text-lg transition-transform group-hover:scale-110">
                {b.emoji}
              </span>
              <span className="min-w-0 text-sm font-medium text-brown">{b.title}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
