import React from "react";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** Logo mark seul (icône) — OpsAI "Pulse" mark */
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
        <linearGradient id="logo-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
      </defs>

      {/* Fond carré arrondi */}
      <rect width="40" height="40" rx="11" fill="url(#logo-bg)" />

      {/* Pulse / heartbeat line — the "ops" heartbeat */}
      <polyline
        points="7,22 13,22 16,12 20,30 24,16 27,22 33,22"
        fill="none"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Small AI sparkle dot — top right */}
      <circle cx="31" cy="11" r="2.2" fill="white" opacity="0.9" />
      <circle cx="31" cy="11" r="3.8" fill="white" opacity="0.15" />
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
