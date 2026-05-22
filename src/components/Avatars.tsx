import React from 'react';

export function RobotAvatar() {
  return (
    <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center animate-bounce duration-[3000ms]">
      {/* Robot casing */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-slate-800 to-indigo-950 rounded-2xl border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center overflow-hidden">
        {/* Antenna */}
        <div className="absolute top-1 w-1 h-2 bg-gradient-to-t from-cyan-300 to-cyan-400 rounded-full" />
        <div className="absolute top-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-75" />

        {/* Dynamic mechanical grid matrix */}
        <div className="w-[85%] h-[85%] border border-cyan-500/10 rounded-xl relative flex flex-col items-center justify-center z-10 bg-slate-900/60">
          {/* Eyes (Glowing cyan screen with scanlines) */}
          <div className="w-[75%] h-[40%] bg-black rounded-lg border border-cyan-500/30 flex items-center justify-around px-1.5 relative overflow-hidden">
            {/* Blinking eyes matrix LEDs */}
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping duration-[1000ms] shadow-[0_0_8px_rgba(34,211,238,1)]" />
            <div className="w-2.5 h-2 bg-gradient-to-br from-cyan-300 to-cyan-500 rounded-md shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <div className="w-2.5 h-2 bg-gradient-to-br from-cyan-300 to-cyan-500 rounded-md shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping duration-[1200ms] shadow-[0_0_8px_rgba(34,211,238,1)]" />
            {/* Horizontal scanline */}
            <div className="absolute inset-x-0 h-[1px] bg-cyan-500/20 top-2 animate-pulse" />
          </div>

          {/* Electronic mouth matrix */}
          <div className="w-[60%] h-1 bg-cyan-500/60 rounded-full mt-2 relative overflow-hidden">
            <div className="absolute inset-y-0 bg-cyan-300 w-1/2 left-1/4 animate-pulse duration-[500ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function KurdishManAvatar() {
  return (
    <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
      {/* Profile Ring with Kurdish flag-colored concentric circles */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#E31E24] via-[#FDC10C] to-[#14913B] p-0.5 shadow-lg shadow-indigo-950/50">
        <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden relative">
          
          {/* Authentic SVG Character design with Kurdish Jamadani turban and traditional mustache */}
          <svg viewBox="0 0 100 100" className="w-full h-full text-white" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Detailed Black Spotted White Pearls Pattern */}
              <pattern id="jamadani" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
                <rect width="12" height="12" fill="#121214" />
                <circle cx="6" cy="6" r="1.5" fill="#ffffff" />
                <circle cx="0" cy="0" r="1" fill="#ffffff" opacity="0.8" />
                <circle cx="12" cy="0" r="1" fill="#ffffff" opacity="0.8" />
                <circle cx="0" cy="12" r="1" fill="#ffffff" opacity="0.8" />
                <circle cx="12" cy="12" r="1" fill="#ffffff" opacity="0.8" />
              </pattern>
            </defs>

            {/* Backround sky gradient */}
            <rect width="100" height="100" fill="url(#avatar-sky)" className="opacity-15" />

            {/* Traditional Kurdish Vest / Shirt */}
            {/* Left Collar (Kurdish vest - Jلی کوردی) */}
            <path d="M 25,85 L 50,65 L 75,85 L 70,100 L 30,100 Z" fill="#3e2723" />
            {/* Inner golden/yellow traditional shirt (Kiras) with rounded neck */}
            <path d="M 40,75 C 40,70 60,70 60,75 L 50,95 Z" fill="#FDC10C" />

            {/* Neck */}
            <rect x="42" y="60" width="16" height="15" fill="#ffd54f" />

            {/* Human Face Details */}
            <circle cx="50" cy="45" r="22" fill="#ffe082" />

            {/* Friendly majestic Kurdish Mustache (برۆ و سمێڵی گەورەی کوردی ڕەسەن) */}
            <path d="M 33,54 C 40,54 44,52 48,55 C 50,56 50,56 52,55 C 56,52 60,54 67,54 C 61,58 52,59 50,58 C 48,59 39,58 33,54 Z" fill="#1e1b18" />
            {/* Thick authentic black eyebrows */}
            <path d="M 33,34 Q 40,29 46,34" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 54,34 Q 60,29 67,34" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* Eyes */}
            <circle cx="41" cy="40" r="2" fill="#1e1b18" />
            <circle cx="59" cy="40" r="2" fill="#1e1b18" />

            {/* Traditional Kurdish Turban/Jamadani/Seroen wrapped carefully around head */}
            {/* Red and white checked pattern wraps recursively */}
            <path d="M 23,32 C 16,32 16,18 30,15 C 44,12 60,11 70,15 C 84,18 84,32 77,32 C 73,22 28,21 23,32 Z" fill="url(#jamadani)" />
            {/* Top wrapper cap node */}
            <ellipse cx="50" cy="18" rx="20" ry="8" fill="url(#jamadani)" />
            {/* Side hanging strap fringe (تەلی جەمەدانی) */}
            <path d="M 22,30 Q 15,45 18,55 Q 16,65 19,70 Q 22,70 20,55 Z" fill="#1e1b18" />
          </svg>
          
          {/* Subtle golden lighting particles */}
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-40" />
        </div>
      </div>
    </div>
  );
}
