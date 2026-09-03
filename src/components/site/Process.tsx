import { PROCESS } from "@/lib/shop-data";
import { Reveal, SectionHeading } from "./Reveal";

const EMOJI = ["🐄", "🥛", "🪵", "🧈", "🫙", "🚚"];

export function Process() {
  return (
    <section id="process" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Our Process"
          title="From Farm to Your Kitchen"
          subtitle="Six patient steps, unchanged for generations."
        />

        <div className="relative mt-14">
          <span className="absolute top-7 left-7 hidden h-px w-[calc(100%-3.5rem)] bg-gradient-to-r from-gold/20 via-gold to-gold/20 lg:block" />
          <span className="absolute top-0 left-7 h-full w-px bg-gradient-to-b from-gold/20 via-gold to-gold/20 lg:hidden" />

          <ol className="grid gap-8 lg:grid-cols-6 lg:gap-4">
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.08}>
                <li className="relative flex gap-4 lg:block">
                  <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/40 bg-card text-xl shadow-warm">
                    {EMOJI[i]}
                  </span>
                  <div className="min-w-0 lg:mt-4">
                    <span className="text-[11px] font-semibold tracking-[0.22em] text-gold-deep uppercase">
                      Step {i + 1}
                    </span>
                    <h3 className="mt-1 font-display text-lg leading-tight font-semibold text-brown">
                      {p.step}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
