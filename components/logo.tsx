import React from "react";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** Logo mark seul (icône) */
export function LogoMark({ size = 32, className = "" }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OpsAI logo"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="logo-grad-inner" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>

      {/* Fond carré arrondi gradient */}
      <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />

      {/* Nœud gauche */}
      <circle cx="10" cy="20" r="3.5" fill="white" opacity="0.9" />
      {/* Nœud haut */}
      <circle cx="20" cy="9" r="3.5" fill="white" opacity="0.9" />
      {/* Nœud droit */}
      <circle cx="30" cy="20" r="3.5" fill="white" opacity="0.9" />
      {/* Nœud bas */}
      <circle cx="20" cy="31" r="3.5" fill="white" opacity="0.9" />

      {/* Connexions (lignes de flux) */}
      <line x1="13" y1="18" x2="17.5" y2="11.5" stroke="white" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
      <line x1="22.5" y1="11.5" x2="27" y2="18" stroke="white" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
      <line x1="27" y1="22" x2="22.5" y2="28.5" stroke="white" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
      <line x1="17.5" y1="28.5" x2="13" y2="22" stroke="white" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />

      {/* Centre : éclair IA */}
      <path
        d="M21.8 13.5 L17.5 21.5 H21L18.2 26.5 L22.5 18.5 H19.2Z"
        fill="white"
        opacity="0.95"
      />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  className?: string;
  dark?: boolean;
}

/** Logo complet (icône + texte) */
export function Logo({ size = 32, className = "", dark = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span
        className="font-bold tracking-tight"
        style={{
          fontSize: size * 0.65,
          color: dark ? "white" : "#0f0f0f",
          letterSpacing: "-0.02em",
        }}
      >
        Ops<span style={{ color: "#4F46E5" }}>AI</span>
      </span>
    </span>
  );
}

/** Favicon-style tiny logo */
export function LogoFavicon() {
  return <LogoMark size={24} />;
}
