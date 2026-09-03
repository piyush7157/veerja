import { Award, HandHeart, Leaf, ShieldCheck, Soup, Sparkles } from "lucide-react";

import { FEATURES } from "@/lib/shop-data";
import { Reveal, SectionHeading } from "./Reveal";

const ICONS = [Award, Sparkles, Leaf, Soup, ShieldCheck, HandHeart];

export function WhyUs() {
  return (
    <section id="why" className="bg-beige/60 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Our Promise"
          title="Why Choose Veerja Eats?"
          subtitle="A small brand with an old-fashioned obsession: doing every single step the honest way."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={f.title} delay={i * 0.07}>
                <article className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-warm">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold-deep transition-transform group-hover:scale-110">
                    <Icon className="h-5.5 w-5.5" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-brown">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
