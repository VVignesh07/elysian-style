import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="py-20 lg:py-28 bg-muted">
      <ScrollReveal>
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <p className="text-xs font-body text-luxury-spacing-wide text-muted-foreground mb-3">
            Stay Connected
          </p>
          <h2 className="font-heading text-4xl lg:text-5xl font-light text-foreground mb-4">
            Join Our <span className="italic">Exclusive</span> Club
          </h2>
          <p className="font-body text-sm text-muted-foreground max-w-md mx-auto mb-10">
            Be the first to know about new collections, exclusive offers, and curated style inspiration.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button className="luxury-btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default Newsletter;
