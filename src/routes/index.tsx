import { createFileRoute } from "@tanstack/react-router";

import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Benefits } from "@/components/site/Benefits";
import { ProductSection } from "@/components/site/ProductSection";
import { WhyUs } from "@/components/site/WhyUs";
import { Process } from "@/components/site/Process";
import { Showcase } from "@/components/site/Showcase";
import { Testimonials } from "@/components/site/Testimonials";
import { FaqSection } from "@/components/site/FaqSection";
import { FinalCta } from "@/components/site/FinalCta";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { Checkout } from "@/components/site/Checkout";
import { OrderSuccess } from "@/components/site/OrderSuccess";

const TITLE = "Veerja Eats | Premium A2 Cow Ghee, Bilona Churned";
const DESCRIPTION =
  "Buy Veerja Eats premium A2 cow ghee — hand-churned by the traditional bilona method from free-grazing desi cow milk. 250ml, 500ml & 1L jars, free delivery in India.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return (
    <CartProvider>
      <div className="min-h-screen overflow-x-hidden bg-background">
        <Header />
        <main>
          <Hero />
          <Benefits />
          <ProductSection />
          <WhyUs />
          <Process />
          <Showcase />
          <Testimonials />
          <FaqSection />
          <FinalCta />
        </main>
        <Footer />
        <CartDrawer />
        <Checkout />
        <OrderSuccess />
        <Toaster position="bottom-right" />
      </div>
    </CartProvider>
  );
}
