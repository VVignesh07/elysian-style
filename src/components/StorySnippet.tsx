import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import logo from "@/assets/zerofasions.in2.png";

const StorySnippet = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!sectionRef.current) return;
          const { top, height } = sectionRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          
          // Total distance the sticky container can scroll is height - windowHeight
          const scrollDistance = height - windowHeight;
          
          // Progress is 0 when top is 0 (section hits top of viewport)
          // Progress is 1 when top is -scrollDistance (section is about to unstick)
          let p = -top / scrollDistance;
          p = Math.max(0, Math.min(1, p));
          
          setProgress(p);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth easing for the transform
  const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
  const smoothProgress = easeOutQuart(progress);

  // Calculate 3D transforms based on progress
  const rotateX = 50 - (smoothProgress * 50); // Starts at 50deg, ends at 0deg
  const scale = 0.6 + (smoothProgress * 0.4); // Starts at 0.6, ends at 1.0
  const opacity = 0.3 + (smoothProgress * 0.7); // Starts dim, gets fully opaque
  
  // Background gradient shift based on progress
  const bgOpacity = smoothProgress * 0.8;

  return (
    <section 
      ref={sectionRef} 
      className="h-[300vh] bg-[#050505] relative"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden perspective-[1500px]">
        
        {/* Giant background text that fades in */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-100"
          style={{ opacity: bgOpacity }}
        >
          <h2 className="font-heading text-[15vw] leading-none text-white/5 select-none text-center whitespace-nowrap">
            OUR STORY
          </h2>
        </div>

        {/* 3D Card Container */}
        <div
          className="w-[90%] max-w-[1200px] h-[80vh] max-h-[800px] rounded-[3rem] relative flex overflow-hidden border border-white/10"
          style={{
            transform: `rotateX(${rotateX}deg) scale(${scale})`,
            opacity: opacity,
            transformStyle: 'preserve-3d',
            boxShadow: `0 ${30 + (progress * 50)}px ${60 + (progress * 40)}px rgba(0,0,0,0.8)`,
            willChange: 'transform, opacity',
          }}
        >
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-3xl z-0" />
          
          {/* Subtle glowing orb inside the card */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[100px] z-0 transition-transform duration-100"
            style={{ transform: `translate(-50%, -50%) scale(${1 + smoothProgress})` }}
          />

          <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-between p-12 lg:p-24 gap-12">
            
            {/* Left Content */}
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <span 
                  className="font-body text-xs font-bold text-white/40 uppercase tracking-[0.4em]"
                  style={{ opacity: smoothProgress, transform: `translateY(${20 - (smoothProgress * 20)}px)`, display: 'block' }}
                >
                  The Beginning
                </span>
                <h2 
                  className="font-heading text-5xl lg:text-7xl font-light text-white uppercase tracking-wider"
                  style={{ opacity: smoothProgress, transform: `translateY(${30 - (smoothProgress * 30)}px)` }}
                >
                  Zero To <br className="hidden lg:block"/>
                  <span className="text-shimmer-white">Limitless</span>
                </h2>
              </div>

              <div 
                className="space-y-6 text-white/60 font-body text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
                style={{ opacity: smoothProgress, transform: `translateY(${40 - (smoothProgress * 40)}px)` }}
              >
                <p>
                  Founded by brothers Arun and Vicky, Zero Fashion was born from a simple but powerful dream to build something bold and different.
                </p>
                <p>
                  We started from zero: no legacy, just unlimited ambition and a belief that style is the ultimate form of self-expression.
                </p>
              </div>

              <div style={{ opacity: smoothProgress, transform: `translateY(${50 - (smoothProgress * 50)}px)` }}>
                <Link
                  to="/our-story"
                  className="inline-flex items-center gap-4 group/link font-body text-sm font-bold uppercase tracking-[.2em] text-white hover:text-white transition-colors duration-300 mt-4"
                >
                  Discover our journey
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover/link:border-white group-hover/link:bg-white group-hover/link:text-black transition-all duration-300">
                    <ArrowRight size={18} strokeWidth={2} />
                  </div>
                </Link>
              </div>
            </div>

            {/* Right Visual Element (Abstract Art / Logo mark) */}
            <div 
              className="hidden lg:flex flex-1 items-center justify-center relative"
              style={{ 
                opacity: smoothProgress,
                transform: `translateY(${60 - (smoothProgress * 60)}px) translateZ(50px)`,
              }}
            >
               <div className="relative w-64 h-64 rounded-full border border-white/20 flex items-center justify-center p-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent animate-pulse" />
                  <img src={logo} alt="Zero Fashion" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
                  {/* Orbit rings */}
                  <div className="absolute inset-2 border border-white/10 rounded-full animate-[spin_20s_linear_infinite]" style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
                  <div className="absolute inset-6 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent' }} />
               </div>
            </div>

          </div>
        </div>

        {/* Scroll indicator (fades out as you scroll down) */}
        <div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-opacity duration-300"
          style={{ opacity: 1 - smoothProgress * 2 }}
        >
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </div>

      </div>
    </section>
  );
};

export default StorySnippet;
