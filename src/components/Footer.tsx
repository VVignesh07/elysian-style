import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/zerofasions.in2.png";
import { Link } from "react-router-dom";

const Footer = () => {
  const links = {
    Shop: ["Men", "Women", "New Arrivals", "Sale", "Collections"],
    Help: ["FAQ", "Shipping", "Returns", "Size Guide"],
  };

  return (
    <footer className="bg-[#050505] text-white py-20 relative overflow-hidden">
      {/* Cinematic gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{
        background: 'radial-gradient(circle at 50% -20%, rgba(255,255,255,0.05) 0%, transparent 60%)'
      }} />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-10 mb-20">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <img
              src={logo}
              alt="Zero Fashion"
              className="h-16 w-auto object-contain mb-8 filter grayscale brightness-200"
            />
            <p className="font-body text-sm text-white/50 leading-relaxed max-w-xs">
              Premium apparel curated for the bold. Timeless elegance meets contemporary design.
            </p>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-body text-[10px] font-bold text-white/30 uppercase tracking-[.35em] mb-6">
                {title}
              </h4>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="font-body text-sm text-white/60 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-0 h-px bg-white transition-all duration-300 group-hover:w-3" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-body text-[10px] font-bold text-white/30 uppercase tracking-[.35em] mb-6">
              Contact Us
            </h4>
            <ul className="space-y-5">
              <li>
                <a href="mailto:zerofashion2025@gmail.com" className="group flex items-start gap-4 text-sm text-white/60 hover:text-white transition-colors duration-300">
                  <Mail size={16} className="mt-0.5 text-white/40 shrink-0 group-hover:text-white transition-colors" />
                  <span>zerofashion2025@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-4 text-sm text-white/60">
                  <Phone size={16} className="mt-0.5 text-white/40 shrink-0" />
                  <div className="flex flex-col gap-2">
                    <a href="tel:+916369835221" className="hover:text-white transition-colors duration-300">6369835221</a>
                    <a href="tel:+917603917369" className="hover:text-white transition-colors duration-300">7603917369</a>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-4 text-sm text-white/60">
                  <MapPin size={16} className="mt-0.5 text-white/40 shrink-0" />
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

        <div className="border-t border-white/10 pt-10 flex flex-col items-center gap-8">
          <div className="flex flex-col items-center">
            <p className="text-[9px] uppercase tracking-[.4em] text-white/30 mb-3 font-body">
              Designed & Developed by
            </p>
            <span className="text-sm sm:text-lg font-heading tracking-[.1em] text-shimmer-white px-4">
              Arun & Vicky duo bro's brand
            </span>
          </div>

          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="font-body text-xs text-white/30">
              © 2026 ZERO FASHION. All rights reserved.
            </p>
            <div className="flex gap-8">
              <Link
                to="/privacy-policy"
                className="font-body text-xs text-white/30 hover:text-white transition-colors duration-300"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="font-body text-xs text-white/30 hover:text-white transition-colors duration-300"
              >
                Terms
              </Link>
              <Link
                to="/cookie-policy"
                className="font-body text-xs text-white/30 hover:text-white transition-colors duration-300"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
