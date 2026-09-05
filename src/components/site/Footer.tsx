import { Facebook, Instagram, Mail, MessageCircle, Phone, Youtube } from "lucide-react";

const COLUMNS = [
  {
    title: "Veerja Eats",
    links: ["About Us", "Shop", "Contact", "FAQ"],
  },
  {
    title: "Policies",
    links: ["Shipping Policy", "Return Policy", "Privacy Policy", "Terms & Conditions"],
  },
];

const SOCIALS = [
  { label: "Instagram", Icon: Instagram },
  { label: "Facebook", Icon: Facebook },
  { label: "YouTube", Icon: Youtube },
  { label: "WhatsApp", Icon: MessageCircle },
];

export function Footer({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <footer className="border-t-2 border-gold/40 bg-gradient-to-b from-brown via-brown to-[oklch(0.24_0.055_163)] text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4">
        <div className="min-w-0 lg:col-span-2">
          <div className="flex min-w-0 items-center gap-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt="Veerja Eats" className="h-12 w-auto max-w-52 rounded bg-cream object-contain px-2 py-1" />
            ) : (
              <>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-deep font-semibold text-brown">
                  वी
                </span>
                <span className="font-display text-2xl font-semibold text-cream">Veerja Eats</span>
              </>
            )}
          </div>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
            Premium A2 Cow Ghee, hand-churned in small batches using the traditional bilona method.
            Purity, tradition and trust in every jar.
          </p>
          <div className="mt-5 space-y-2 text-sm text-cream/75">
            <a href="tel:+919000000000" className="flex items-center gap-2 hover:text-gold">
              <Phone className="h-4 w-4 shrink-0" /> +91 90000 00000
            </a>
            <a href="mailto:hello@veerjaeats.com" className="flex items-center gap-2 hover:text-gold">
              <Mail className="h-4 w-4 shrink-0" /> hello@veerjaeats.com
            </a>
          </div>
        </div>

        {COLUMNS.map((c) => (
          <nav key={c.title} className="min-w-0">
            <h3 className="font-display text-lg font-semibold text-gold">{c.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#home" className="transition-colors hover:text-gold">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-cream/15">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between sm:px-6">
          <p className="text-xs text-cream/60">
            © 2026 Veerja Eats. All Rights Reserved.
          </p>
          <ul className="flex gap-2.5">
            {SOCIALS.map(({ label, Icon }) => (
              <li key={label}>
                <a
                  href="#home"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-cream/25 transition-all hover:border-gold hover:bg-gold hover:text-brown"
                >
                  <Icon className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
