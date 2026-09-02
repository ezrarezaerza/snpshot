import React from "react";

/**
 * Standardized Button & Pill Design Tokens for SNPSHOT Studio
 * 
 * Variants:
 * - primary: Main conversion actions (Launch Booth, Start Photoshoot, Confirm)
 * - secondary: Structured dark navy panel buttons with crisp borders
 * - filter-pill: Taxonomy & category selection pills (matching the yellow reference aesthetic)
 * - format-chip: Compact format / layout filter chips (3-Grid, 4-Grid, 2x2, etc.)
 * - ghost / outline: Transparent with hairline border
 * - like: Compact, tactile heart / hype pill for cards
 */

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  active = false,
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ...props
}) => {
  // Base classes applied to all button tokens
  const baseClasses = "inline-flex items-center justify-center font-sans transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  // Size definitions with mathematical padding and height
  const sizeClasses = {
    xs: "text-[10px] font-mono py-1 px-2.5 rounded-lg gap-1",
    sm: "text-xs font-mono py-1.5 px-3.5 rounded-xl gap-1.5",
    md: "text-xs font-medium py-2.5 px-5 rounded-xl gap-2",
    lg: "text-sm font-semibold py-3 px-6 rounded-2xl gap-2.5",
    pill: "text-xs font-mono py-2 px-4 rounded-full gap-2",
    chip: "text-[11px] font-mono py-1.5 px-3 rounded-lg gap-1.5"
  };

  // Variant styling hierarchy
  const variantClasses = {
    // 1. Primary Action (Sleek dark indigo gradient with crisp border, refined shadow)
    primary: "bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#9d35ff] hover:from-[#7226FF] hover:to-[#F042FF] text-white font-bold uppercase tracking-wider border border-white/25 shadow-[0_4px_16px_rgba(114,38,255,0.25)] hover:shadow-[0_6px_22px_rgba(240,66,255,0.35)] hover:-translate-y-0.5 active:translate-y-0",
    
    // 2. Secondary Action (Solid dark navy with high-contrast structural border)
    secondary: "bg-[#0e0048] hover:bg-[#160078] text-[#FFE5F1] hover:text-white font-medium border border-[#2e109d] hover:border-[#F042FF]/60 shadow-sm hover:-translate-y-0.5 active:translate-y-0",
    
    // 3. Filter Pill (Category filters matching the yellow aesthetic in user prompt)
    "filter-pill": active
      ? "bg-gradient-to-r from-[#160078] to-[#7226FF] text-white font-bold border border-[#F042FF]/60 shadow-[0_2px_12px_rgba(240,66,255,0.3)] scale-[1.02]"
      : "bg-[#0e0048]/90 hover:bg-[#160078] text-zinc-300 hover:text-white font-medium border border-[#2e109d] hover:border-white/30",
    
    // 4. Format Chip (Low profile layout selectors)
    "format-chip": active
      ? "bg-white text-[#010030] font-bold border border-white shadow-[0_2px_8px_rgba(255,255,255,0.25)]"
      : "bg-[#0e0048]/80 hover:bg-[#160078]/60 text-zinc-400 hover:text-zinc-200 font-medium border border-[#2e109d]/80 hover:border-white/20",

    // 5. Ghost / Hairline Outline
    ghost: "bg-transparent hover:bg-white/10 text-zinc-300 hover:text-white border border-white/15 hover:border-white/30",
    
    // 6. Like / Counter Pill
    like: active
      ? "bg-[#F042FF]/15 text-[#F042FF] font-mono font-bold border border-[#F042FF]/50"
      : "bg-white/90 hover:bg-white text-[#010030] hover:text-[#F042FF] font-mono font-bold border border-[#160078]/20 hover:border-[#F042FF]/60"
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const selectedVariant = variantClasses[variant] || variantClasses.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${selectedSize} ${selectedVariant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
