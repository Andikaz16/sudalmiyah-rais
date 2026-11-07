import React from "react";

export function ChatHPTLogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo ChatHPT"
    >
      {/* Central circular hub */}
      <circle cx="50" cy="50" r="10" fill="currentColor" />
      {/* 10 swirling radiant turbine petals matching ChatHPT branding */}
      {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
        <path
          key={deg}
          d="M 50 50 C 58 32, 74 34, 76 46 C 78 56, 68 64, 52 56 Z"
          transform={`rotate(${deg} 50 50)`}
          opacity="0.92"
        />
      ))}
      <circle cx="50" cy="50" r="4" fill="#ffffff" />
    </svg>
  );
}

export function SuryaMuhammadiyahLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Lambang Surya Muhammadiyah"
    >
      {/* Inner circle with decorative ring */}
      <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="11" fill="currentColor" opacity="0.9" />
      {/* Center star / dot */}
      <circle cx="50" cy="50" r="3" fill="#ffffff" />
      {/* 12 Radiant Rays of Muhammadiyah Sun */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 50 50)`}>
          {/* Main long ray */}
          <polygon points="46,31 50,7 54,31" />
          {/* Secondary smaller ray */}
          <polygon points="48,31 50,18 52,31" opacity="0.75" />
        </g>
      ))}
    </svg>
  );
}
