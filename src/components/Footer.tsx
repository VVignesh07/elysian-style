import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/zerofasions.in2.png";

const Footer = () => {
  const links = {
    Shop: ["Men", "Women", "New Arrivals", "Sale", "Collections"],
    Help: ["FAQ", "Shipping", "Returns", "Size Guide"],
  };

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <img
              src={logo}
              alt="Zero Fashion"
              className="h-20 w-auto object-contain brightness-110 mb-6"
            />
            <p className="font-body text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
              Premium fashion curated for the modern individual. Timeless elegance meets contemporary design.
            </p>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-body text-xs text-luxury-spacing text-primary-foreground/50 mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="font-body text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-body text-xs text-luxury-spacing text-primary-foreground/50 mb-5 text-uppercase">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:zerofashion2025@gmail.com" className="group flex items-start gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  <Mail size={16} className="mt-0.5 text-luxury-gold shrink-0" />
                  <span>zerofashion2025@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-primary-foreground/70">
                  <Phone size={16} className="mt-0.5 text-luxury-gold shrink-0" />
                  <div className="flex flex-col gap-1">
                    <a href="tel:+916369835221" className="hover:text-primary-foreground transition-colors">6369835221</a>
                    <a href="tel:+917603917369" className="hover:text-primary-foreground transition-colors">7603917369</a>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-primary-foreground/70">
                  <MapPin size={16} className="mt-0.5 text-luxury-gold shrink-0" />
                  <span className="leading-relaxed">
                    Vakkanangundu, Kariyapatti (Taluk),<br />
                    Virudhunagar (District),<br />
                    Tamil Nadu 626104
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/40 mb-2">
              Designed & Developed by
            </p>
            <span className="text-lg font-semibold tracking-wide bg-gradient-to-r from-luxury-gold via-white to-luxury-gold bg-clip-text text-transparent">
              Arun & Vicky duo bro's brand
            </span>
          </div>

          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-xs text-primary-foreground/40">
              © 2026 ZERO FASHION. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Cookies"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="font-body text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
