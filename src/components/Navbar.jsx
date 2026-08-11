import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Camera, Sparkles, LogOut, Zap } from "lucide-react";
import gsap from "gsap";

export default function Navbar({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isAnimatingRef = useRef(false);

  const navRef = useRef(null);
  const dropdownRef = useRef(null);

  const isCreatorRoute = location.pathname === "/creator" || location.pathname === "/admin";

  // Get the main content element to push down
  const getContentElement = () => {
    return (
      document.getElementById("content") ||
      document.querySelector(".content") ||
      document.getElementById("home-root-container") ||
      document.querySelector(".web3-home-container") ||
      navRef.current?.parentElement?.querySelector(".relative.z-10") ||
      navRef.current?.parentElement
    );
  };

  // Reset GSAP positions on route change
  useEffect(() => {
    const contentEl = getContentElement();
    if (contentEl) {
      gsap.set([dropdownRef.current, navRef.current, contentEl], { y: 0 });
    }
    setIsOpen(false);
    isAnimatingRef.current = false;
  }, [location.pathname]);

  const toggleMenu = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const dropdown = dropdownRef.current;
    const navigation = navRef.current;
    const content = getContentElement();

    if (!isOpen) {
      // OPENING THE MENU: Immediate and synchronized GSAP push-down animation
      const openTimeline = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;
        }
      });

      // Reset positions & opacities before animating
      gsap.set(
        ".dropdown__section--one h1, .dropdown__section--one p, .dropdown__button",
        {
          opacity: 1,
          y: 0
        }
      );

      openTimeline
        .to([dropdown, navigation, content], {
          y: "50vh",
          duration: 0.45,
          ease: "power2.out"
        })
        .from(
          ".dropdown__section--one h1",
          {
            opacity: 0,
            y: 20,
            duration: 0.4,
            ease: "power2.out",
            delay: 0.15
          },
          "-=0.3"
        )
        .from(
          ".dropdown__section--one p",
          {
            opacity: 0,
            y: 20,
            duration: 0.4,
            ease: "power2.out"
          },
          "-=0.2"
        )
        .from(
          ".dropdown__button",
          {
            opacity: 0,
            y: 20,
            duration: 0.3,
            stagger: 0.08,
            ease: "power2.out"
          },
          "-=0.2"
        )
        .to(
          ".divider",
          { width: "100%", duration: 0.3, ease: "power2.out" },
          "-=0.35"
        );

      if (dropdown) dropdown.classList.add("open");
      setIsOpen(true);
    } else {
      // CLOSING THE MENU: Reverse animations smoothly
      const closeTimeline = gsap.timeline({
        onComplete: () => {
          if (dropdown) dropdown.classList.remove("open");
          setIsOpen(false);
          isAnimatingRef.current = false;
        }
      });

      closeTimeline
        .to(".dropdown__button", {
          opacity: 0,
          y: 20,
          duration: 0.25,
          stagger: 0.04,
          ease: "power2.in"
        })
        .to(
          ".dropdown__section--one p",
          { opacity: 0, y: 20, duration: 0.25, ease: "power2.in" },
          "-=0.1"
        )
        .to(
          ".dropdown__section--one h1",
          { opacity: 0, y: 20, duration: 0.25, ease: "power2.in" },
          "-=0.1"
        )
        .to(".divider", { width: "0%", duration: 0.3, ease: "power2.in" })
        .add(() => {
          gsap.to([dropdown, navigation, content], {
            y: "0",
            duration: 0.4,
            ease: "power2.inOut"
          });
        });
    }
  };

  const handleNavClick = (path) => {
    if (isOpen) {
      const dropdown = dropdownRef.current;
      const navigation = navRef.current;
      const content = getContentElement();

      gsap.to([dropdown, navigation, content], {
        y: "0",
        duration: 0.35,
        ease: "power2.inOut",
        onComplete: () => {
          if (dropdown) dropdown.classList.remove("open");
          setIsOpen(false);
          navigate(path);
        }
      });
    } else {
      navigate(path);
    }
  };

  return (
    <>
      {/* DROPDOWN PUSH-DOWN PANEL */}
      <div 
        ref={dropdownRef} 
        id="dropdown" 
        className="dropdown fixed top-[-50vh] left-0 right-0 w-full h-[50vh] z-[90] bg-[#0b0136]/95 backdrop-blur-2xl border-b border-[#F042FF]/30 flex flex-col justify-between px-6 sm:px-12 md:px-16 py-6 md:py-8 text-white shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden"
      >
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-15" style={{
          backgroundImage: "radial-gradient(#F042FF 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }} />

        {/* SECTION ONE: Word + Quote */}
        <div className="dropdown__section dropdown__section--one flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 relative z-10">
          <h1 className="dropdown__word font-display font-black text-3xl sm:text-6xl md:text-8xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FFE5F1] to-[#F042FF]">
            CREATE
          </h1>
          <p className="dropdown__quote font-mono text-xs sm:text-sm md:text-base text-[#FFE5F1] max-w-xs sm:max-w-md text-left sm:text-right leading-relaxed border-l-2 sm:border-l-0 sm:border-r-2 border-[#F042FF] pl-3 sm:pl-0 sm:pr-4 font-semibold tracking-wide">
            ✦ "In every shutter click, a thousand unspoken memories are frozen in time." ✦
          </p>
        </div>

        {/* SECTION THREE: Divider + Navigation Links */}
        <div className="dropdown__section dropdown__section--three relative z-10 w-full">
          <div className="divider w-0 h-[1px] bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-transparent my-3 sm:my-5" />

          <div className="dropdown__nav flex flex-wrap items-center gap-6 sm:gap-10 pt-2">
            <span 
              onClick={() => handleNavClick("/")}
              className={`dropdown__button font-display font-black text-lg sm:text-2xl md:text-3xl uppercase tracking-wider cursor-pointer transition-colors ${
                location.pathname === "/" 
                  ? "text-[#F042FF] underline decoration-2 underline-offset-8" 
                  : "text-white/80 hover:text-white"
              }`}
            >
              HOME
            </span>

            <span 
              onClick={() => handleNavClick("/welcome")}
              className={`dropdown__button font-display font-black text-lg sm:text-2xl md:text-3xl uppercase tracking-wider cursor-pointer transition-colors ${
                ["/welcome", "/photobooth", "/preview"].includes(location.pathname) 
                  ? "text-[#F042FF] underline decoration-2 underline-offset-8" 
                  : "text-white/80 hover:text-white"
              }`}
            >
              BOOTH
            </span>

            <span 
              onClick={() => handleNavClick("/creator")}
              className={`dropdown__button font-display font-black text-lg sm:text-2xl md:text-3xl uppercase tracking-wider cursor-pointer transition-colors ${
                isCreatorRoute 
                  ? "text-[#F042FF] underline decoration-2 underline-offset-8" 
                  : "text-white/80 hover:text-white"
              }`}
            >
              CREATOR
            </span>

            <span 
              onClick={() => handleNavClick("/privacy-policy")}
              className={`dropdown__button font-display font-black text-lg sm:text-2xl md:text-3xl uppercase tracking-wider cursor-pointer transition-colors ${
                location.pathname === "/privacy-policy" 
                  ? "text-[#F042FF] underline decoration-2 underline-offset-8" 
                  : "text-white/80 hover:text-white"
              }`}
            >
              PRIVACY
            </span>

            <span 
              onClick={() => handleNavClick("/contact")}
              className={`dropdown__button font-display font-black text-lg sm:text-2xl md:text-3xl uppercase tracking-wider cursor-pointer transition-colors ${
                location.pathname === "/contact" 
                  ? "text-[#F042FF] underline decoration-2 underline-offset-8" 
                  : "text-white/80 hover:text-white"
              }`}
            >
              CONTACT
            </span>

            {isCreatorRoute && onLogout && (
              <span 
                onClick={() => {
                  if (isOpen) toggleMenu();
                  onLogout();
                }}
                className="dropdown__button font-display font-bold text-sm sm:text-base uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
              >
                <LogOut className="w-4 h-4" /> LOG OUT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION HEADER BAR */}
      <nav 
        ref={navRef} 
        id="navigation" 
        className="navigation fixed top-0 left-0 right-0 w-full z-[100] px-4 sm:px-8 py-3.5 bg-[#010030]/90 backdrop-blur-xl border-b border-[#160078]/25 shadow-lg"
      >
        <div className="navigation__container max-w-7xl mx-auto flex items-center justify-between">
          
          {/* BRAND LOGO */}
          <Link 
            to="/" 
            onClick={(e) => {
              if (isOpen) {
                e.preventDefault();
                handleNavClick("/");
              }
            }}
            className="navigation__logo flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(240,66,255,0.3)]">
              <Camera className="text-white w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <span className="text-white text-lg sm:text-xl font-display font-black tracking-tight select-none">
              SN<span className="bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">PSHOT</span>
            </span>
          </Link>

          {/* MENU TOGGLE BUTTON (SUBTLE TEXT ONLY) */}
          <div className="flex items-center">
            <span 
              id="menu-btn" 
              onClick={toggleMenu}
              className="navigation__menu-btn font-mono text-sm sm:text-base font-extrabold uppercase tracking-widest text-white hover:text-[#F042FF] transition-colors cursor-pointer select-none"
            >
              {isOpen ? "CLOSE" : "MENU"}
            </span>
          </div>

        </div>
      </nav>
    </>
  );
}

