import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useHeroSlides } from "@/hooks/useHeroSlides";

/* ── Fallback Image data ── */
const FALLBACK_IMAGES = [
  {
    src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png",
    bg: "#F4845F",
  },
  {
    src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png",
    bg: "#6BBF7A",
  },
  {
    src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png",
    bg: "#E882B4",
  },
  {
    src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png",
    bg: "#6EB5FF",
  },
];

const BG_COLORS = ["#F4845F", "#6BBF7A", "#E882B4", "#6EB5FF", "#A982E8", "#FFB56B"];

const TRANSITION_MS = 650;
const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

/* ── Grain overlay SVG (fractalNoise) ── */
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.08'/%3E%3C/svg%3E")`;

type Role = "center" | "left" | "right" | "back" | "hidden";

const HeroSection = () => {
  const { data: dbSlides = [], isLoading } = useHeroSlides();
  const activeSlides = dbSlides.filter(s => s.is_active).sort((a, b) => a.display_order - b.display_order);
  
  // Use DB slides if available, otherwise fallback
  const displayItems = activeSlides.length > 0 
    ? activeSlides.map((slide, i) => ({
        id: slide.id,
        src: slide.image_url,
        bg: slide.bg_color || BG_COLORS[i % BG_COLORS.length],
        title: slide.title || "ZERO FASHION",
        subtitle: slide.subtitle || "Premium fashion for every occasion.",
        cta_text: slide.cta_text || "DISCOVER IT",
        cta_link: slide.cta_link || "#"
      }))
    : FALLBACK_IMAGES.map((img, i) => ({
        id: i.toString(),
        src: img.src,
        bg: img.bg,
        title: "ZERO FASHION",
        subtitle: "The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.",
        cta_text: "DISCOVER IT",
        cta_link: "#"
      }));

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lockRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Responsive check ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Preload all images ── */
  useEffect(() => {
    displayItems.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });
  }, [displayItems]);

  /* ── Navigate ── */
  const navigate = useCallback(
    (dir: "next" | "prev") => {
      if (isAnimating || displayItems.length <= 1) return;
      setIsAnimating(true);
      const total = displayItems.length;
      setActiveIndex((prev) =>
        dir === "next" ? (prev + 1) % total : (prev + total - 1) % total
      );
      lockRef.current = setTimeout(() => setIsAnimating(false), TRANSITION_MS);
    },
    [isAnimating, displayItems.length]
  );

  useEffect(() => {
    return () => {
      if (lockRef.current) clearTimeout(lockRef.current);
    };
  }, []);

  /* ── Keyboard navigation ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigate("prev");
      if (e.key === "ArrowRight") navigate("next");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  /* ── Auto-slide ── */
  const [isPaused, setIsPaused] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaused || displayItems.length <= 1) return;
    const interval = setInterval(() => {
      navigate("next");
    }, 4000);
    return () => clearInterval(interval);
  }, [navigate, isPaused, displayItems.length]);



  /* ── Roles ── */
  const getRoles = (): Record<number, Role> => {
    const total = displayItems.length;
    if (total === 1) return { 0: "center" };
    if (total === 2) return {
      [activeIndex]: "center",
      [(activeIndex + 1) % total]: "back"
    };
    if (total === 3) return {
      [activeIndex]: "center",
      [(activeIndex + total - 1) % total]: "left",
      [(activeIndex + 1) % total]: "right"
    };
    
    return {
      [activeIndex]: "center",
      [(activeIndex + total - 1) % total]: "left",
      [(activeIndex + 1) % total]: "right",
      [(activeIndex + 2) % total]: "back",
    };
  };

  const roles = getRoles();

  /* ── Per-role styles ── */
  const getRoleStyle = (role: Role | undefined): React.CSSProperties => {
    const transition = [
      "transform",
      "filter",
      "opacity",
      "left",
      "height",
      "bottom",
    ]
      .map((p) => `${p} ${TRANSITION_MS}ms ${EASING}`)
      .join(", ");

    const base: React.CSSProperties = {
      position: "absolute",
      aspectRatio: "0.6 / 1",
      transition,
      willChange: "transform, filter, opacity",
      transformOrigin: "bottom center",
    };

    if (!role || role === "hidden") {
      return {
        ...base,
        transform: "translateX(-50%) scale(0.5)",
        opacity: 0,
        zIndex: -1,
        left: "50%",
        height: isMobile ? "10%" : "20%",
        bottom: isMobile ? "32%" : "12%",
        pointerEvents: "none"
      };
    }

    switch (role) {
      case "center":
        return {
          ...base,
          transform: `translateX(-50%) scale(1)`,
          filter: "blur(0px)",
          opacity: 1,
          zIndex: 20,
          left: "50%",
          height: isMobile ? "75%" : "92%",
          bottom: isMobile ? "12%" : "0",
        };
      case "left":
        return {
          ...base,
          transform: "translateX(-50%) scale(1)",
          filter: "blur(2px)",
          opacity: 0.85,
          zIndex: 10,
          left: isMobile ? "20%" : "30%",
          height: isMobile ? "16%" : "28%",
          bottom: isMobile ? "32%" : "12%",
        };
      case "right":
        return {
          ...base,
          transform: "translateX(-50%) scale(1)",
          filter: "blur(2px)",
          opacity: 0.85,
          zIndex: 10,
          left: isMobile ? "80%" : "70%",
          height: isMobile ? "16%" : "28%",
          bottom: isMobile ? "32%" : "12%",
        };
      case "back":
        return {
          ...base,
          transform: "translateX(-50%) scale(1)",
          filter: "blur(4px)",
          opacity: 1,
          zIndex: 5,
          left: "50%",
          height: isMobile ? "13%" : "22%",
          bottom: isMobile ? "32%" : "12%",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#F4845F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin opacity-50" />
      </div>
    );
  }

  const currentItem = displayItems[activeIndex];

  return (
    <div
      ref={heroRef}
      style={{
        backgroundColor: currentItem.bg,
        transition: `background-color ${TRANSITION_MS}ms ${EASING}`,
        fontFamily: "Inter, sans-serif",
      }}
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="relative w-full"
        style={{ height: "100vh", overflow: "hidden", paddingTop: "80px" }}
      >
        {/* ── 1. Grain overlay ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 50,
            opacity: 0.4,
            backgroundImage: GRAIN_SVG,
            backgroundSize: "200px 200px",
            backgroundRepeat: "repeat",
          }}
        />

        {/* ── 2. Giant ghost text ── */}
        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
          style={{ zIndex: 2, top: "18%" }}
        >
          <span
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: "clamp(60px, 20vw, 320px)",
              fontWeight: 900,
              color: "white",
              opacity: 1,
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {currentItem.title.split('\n')[0] || "ZERO FASHION"}
          </span>
        </div>



        {/* ── 4. Carousel ── */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {displayItems.map((item, idx) => {
            const role = roles[idx] || "hidden";
            return (
              <div key={item.id} style={getRoleStyle(role)}>
                <img
                  src={item.src}
                  alt={item.title || `Slide ${idx + 1}`}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "bottom center",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* ── 5. Bottom-left text + nav buttons ── */}
        <div
          className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24"
          style={{ zIndex: 60, maxWidth: 320 }}
        >
          <p
            className="font-bold uppercase tracking-widest mb-2 sm:mb-3 text-base sm:text-[22px] line-clamp-1"
            style={{
              color: "white",
              opacity: 0.95,
              letterSpacing: "0.02em",
            }}
          >
            {currentItem.title.replace(/\n/g, " ")}
          </p>

          <p
            className="hidden sm:block text-xs sm:text-sm mb-4 sm:mb-5 line-clamp-3"
            style={{
              color: "white",
              opacity: 0.85,
              lineHeight: 1.6,
            }}
          >
            {currentItem.subtitle}
          </p>

          {displayItems.length > 1 && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate("prev")}
                className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full border-2 border-white cursor-pointer"
                style={{
                  background: "transparent",
                  color: "white",
                  transition: "transform 150ms, background-color 150ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.08)";
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                aria-label="Previous figurine"
              >
                <ArrowLeft size={26} strokeWidth={2.25} />
              </button>

              <button
                onClick={() => navigate("next")}
                className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full border-2 border-white cursor-pointer"
                style={{
                  background: "transparent",
                  color: "white",
                  transition: "transform 150ms, background-color 150ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.08)";
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                aria-label="Next figurine"
              >
                <ArrowRight size={26} strokeWidth={2.25} />
              </button>
            </div>
          )}
        </div>

        {/* ── 6. Bottom-right link CTA ── */}
        <div
          className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10"
          style={{ zIndex: 60 }}
        >
          <Link
            to={currentItem.cta_link}
            className="flex items-center gap-2"
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: "clamp(20px, 4vw, 56px)",
              fontWeight: 400,
              color: "white",
              opacity: 0.95,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "opacity 200ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.95";
            }}
          >
            {currentItem.cta_text}
            <ArrowRight
              className="w-5 h-5 sm:w-8 sm:h-8"
              strokeWidth={2.25}
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
