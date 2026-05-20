import { motion } from 'motion/react';
import { Crown } from 'lucide-react';
import { Piece as PieceType, BoardTheme } from '../types';

export type PieceDesignStyle =
  | 'CLASSIC_CYAN'
  | 'CLASSIC_WHITE'
  | 'KURD'
  | 'IRAQ'
  | 'IRAN'
  | 'USA'
  | 'BLACK'
  | 'WHITE'
  | 'BLUE'
  | 'GOLD'
  | 'RED'
  | 'ORANGE'
  | 'GREEN';

interface PieceProps {
  piece: PieceType;
  isSelected?: boolean;
  theme?: BoardTheme;
  pieceStyle?: PieceDesignStyle;
}

export default function Piece({ piece, isSelected, theme, pieceStyle = 'CLASSIC_CYAN' }: PieceProps) {
  const isWoodTheme = theme === 'KURDISH_WOOD';

  // Base 3D container styling tailored to each piece design style
  let baseStyle = '';
  let isFlagSkin = false;

  switch (pieceStyle) {
    case 'CLASSIC_CYAN':
      if (isWoodTheme) {
        baseStyle = 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900 via-amber-950 to-stone-950 border-2 border-amber-600/50 shadow-[inset_0_-4px_10px_rgba(0,0,0,0.85),_0_6px_20px_rgba(0,0,0,0.6)] text-cyan-300';
      } else {
        baseStyle = 'bg-gradient-to-br from-cyan-400 to-blue-600 border border-cyan-300/50 shadow-[inset_0_-2px_10px_rgba(0,0,0,0.3),_0_4px_15px_rgba(34,211,238,0.4)] text-white';
      }
      break;

    case 'CLASSIC_WHITE':
      if (isWoodTheme) {
        baseStyle = 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-100 via-amber-200 to-amber-300 border-2 border-amber-500/40 shadow-[inset_0_-4px_10px_rgba(0,0,0,0.3),_0_6px_20px_rgba(0,0,0,0.4)] text-amber-950';
      } else {
        baseStyle = 'bg-gradient-to-br from-slate-100 to-slate-400 border border-white/80 shadow-[inset_0_-2px_10px_rgba(0,0,0,0.2),_0_4px_15px_rgba(255,255,255,0.4)] text-slate-800';
      }
      break;

    // Flag-based checkers
    case 'KURD':
    case 'IRAQ':
    case 'IRAN':
    case 'USA':
      isFlagSkin = true;
      baseStyle = piece.player === 'CYAN'
        ? 'border-2 border-cyan-400 shadow-[0_5px_15px_rgba(34,211,238,0.5),_inset_0_2px_8px_rgba(255,255,255,0.4)] overflow-hidden'
        : 'border-2 border-amber-300 shadow-[0_5px_15px_rgba(251,191,36,0.5),_inset_0_2px_8px_rgba(255,255,255,0.4)] overflow-hidden';
      break;

    // Direct requested premium styles
    case 'BLACK':
      baseStyle = 'bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 border border-neutral-700/80 shadow-[inset_0_-3px_12px_rgba(0,0,0,0.9),_0_5px_15px_rgba(0,0,0,0.7)] text-slate-300';
      break;

    case 'WHITE':
      baseStyle = 'bg-gradient-to-br from-white via-slate-100 to-slate-200 border border-white shadow-[inset_0_-3px_10px_rgba(0,0,0,0.1),_0_5px_15px_rgba(255,255,255,0.15)] text-slate-800';
      break;

    case 'BLUE':
      baseStyle = 'bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-950 border border-blue-300/60 shadow-[inset_0_-3px_12px_rgba(0,0,0,0.4),_0_5px_15px_rgba(59,130,246,0.4)] text-cyan-200';
      break;

    case 'GOLD':
      baseStyle = 'bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-700 border border-yellow-300/80 shadow-[inset_0_-4px_12px_rgba(0,0,0,0.35),_0_5px_20px_rgba(245,158,11,0.5)] text-amber-950';
      break;

    case 'RED':
      baseStyle = 'bg-gradient-to-br from-red-400 via-red-600 to-rose-950 border border-red-300/60 shadow-[inset_0_-3px_12px_rgba(0,0,0,0.4),_0_5px_15px_rgba(239,68,68,0.4)] text-rose-200';
      break;

    case 'ORANGE':
      baseStyle = 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 border border-orange-300/60 shadow-[inset_0_-3px_12px_rgba(0,0,0,0.4),_0_5px_15px_rgba(249,115,22,0.4)] text-white';
      break;

    case 'GREEN':
      baseStyle = 'bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-900 border border-emerald-300/60 shadow-[inset_0_-3px_12px_rgba(0,0,0,0.4),_0_5px_15px_rgba(16,185,129,0.4)] text-emerald-100';
      break;

    default:
      baseStyle = 'bg-gradient-to-br from-cyan-400 to-blue-600 border border-cyan-300/50 shadow-[inset_0_-2px_10px_rgba(0,0,0,0.3),_0_4px_15px_rgba(34,211,238,0.4)] text-white';
      break;
  }

  // Active halo glow based on piece selection
  const glowStyle = isSelected
    ? piece.player === 'CYAN'
      ? 'shadow-[0_0_35px_rgba(34,211,238,1)] scale-110 ring-4 ring-cyan-400/70 z-30'
      : 'shadow-[0_0_35px_rgba(251,191,36,1)] scale-110 ring-4 ring-amber-400/80 z-30'
    : 'hover:scale-105';

  return (
    <motion.div
      layout
      layoutId={piece.id}
      className={`relative w-[85%] h-[85%] rounded-full flex items-center justify-center transition-all duration-300 ease-out z-10 ${baseStyle} ${glowStyle}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isSelected ? 1.15 : 1, opacity: 1 }}
      whileHover={{ scale: isSelected ? 1.15 : 1.1 }}
    >
      {/* 3D concentric ring bezel layer for non-flag glassy shapes */}
      {!isFlagSkin && (
        <div className="absolute inset-1.5 rounded-full border border-white/20 pointer-events-none flex items-center justify-center">
          <div className="w-[80%] h-[80%] rounded-full border border-black/15 bg-black/5" />
        </div>
      )}

      {/* RENDER DYNAMIC FLAGS */}

      {/* 1. Kurdistan Flag (Accurate high fidelity SVG sun!) */}
      {pieceStyle === 'KURD' && (
        <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden flex flex-col pointer-events-none z-0">
          <div className="h-[33.3%] bg-[#E31E24] w-full" />
          <div className="h-[33.3%] bg-white w-full flex items-center justify-center relative">
            {/* Imposing 21-ray Kurdish Sun SVG */}
            <svg
              viewBox="0 0 100 100"
              className="absolute w-[44%] h-[132%] text-[#FDC10C] fill-current animate-[spin_45s_linear_infinite]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="16" />
              {Array.from({ length: 21 }, (_, i) => {
                const angle = (i * 360) / 21;
                return (
                  <path
                    key={i}
                    d="M 50 11 L 46.5 40 L 53.5 40 Z"
                    transform={`rotate(${angle} 50 50)`}
                    fill="#FDC10C"
                  />
                );
              })}
            </svg>
            <div className="absolute w-[22%] h-[22%] bg-[#FDC10C] rounded-full shadow-[0_0_8px_rgba(253,193,12,0.8)] z-10" />
          </div>
          <div className="h-[33.4%] bg-[#14913B] w-full" />
        </div>
      )}

      {/* 2. Iraq Flag */}
      {pieceStyle === 'IRAQ' && (
        <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden flex flex-col pointer-events-none z-0">
          <div className="h-[33.3%] bg-[#DA121A] w-full" />
          <div className="h-[33.3%] bg-white w-full flex items-center justify-center relative">
            <span
              className="text-[8px] text-[#208040] font-black leading-none select-none tracking-tighter"
              style={{ fontFamily: 'sans-serif' }}
            >
              الله أكبر
            </span>
          </div>
          <div className="h-[33.4%] bg-black w-full" />
        </div>
      )}

      {/* 3. Iran Flag (With crisp center Tulip emblem) */}
      {pieceStyle === 'IRAN' && (
        <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden flex flex-col pointer-events-none z-0">
          <div className="h-[33.3%] bg-[#239F40] w-full" />
          <div className="h-[33.3%] bg-white w-full flex items-center justify-center relative bg-white">
            {/* Standard Red Emblem shape modeled in clean SVG paths */}
            <svg viewBox="0 0 24 24" className="w-[30%] h-[30%] text-[#DA121A] fill-current">
              <path d="M12,4 C11,4 10,7 10,9.5 C10,12 11,14 12,14 C13,14 14,12 14,9.5 C14,7 13,4 12,4 Z M9.5,13.5 C8,13.5 7,15.5 7,18 C7,20.5 8,22 9.5,22 C11,22 12,20.5 12,18 C12,15.5 11,13.5 9.5,13.5 Z M14.5,13.5 C13,13.5 12,15.5 12,18 C12,20.5 13,22 14.5,22 C16,22 17,20.5 17,18 C17,15.5 16,13.5 14.5,13.5 Z" />
            </svg>
          </div>
          <div className="h-[33.4%] bg-[#DA121A] w-full" />
        </div>
      )}

      {/* 4. USA Flag */}
      {pieceStyle === 'USA' && (
        <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden flex flex-col pointer-events-none z-0">
          <div className="relative w-full h-full bg-white flex flex-col">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-[7.7%] bg-[#B22234] w-full mt-[7.7%]" />
            ))}
            <div className="absolute top-0 left-0 w-[55%] h-[55%] bg-[#3C3B6E] flex flex-wrap p-0.5 justify-center items-center content-center gap-0.5 rounded-br-md">
              <div className="w-1 h-1 bg-white rounded-full opacity-90 scale-75" />
              <div className="w-1 h-1 bg-white rounded-full opacity-90 scale-75" />
              <div className="w-1 h-1 bg-white rounded-full opacity-90 scale-75" />
              <div className="w-1 h-1 bg-white rounded-full opacity-80 scale-50" />
            </div>
          </div>
        </div>
      )}

      {/* 3D Glass Layer overlay (Makes checkers pop with glossy lens reflections) */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/35 border border-white/20 pointer-events-none z-15" />
      <div className="absolute top-[8%] left-[12%] w-[25%] h-[25%] bg-white/20 rounded-full blur-[2px] pointer-events-none z-15" />

      {/* Traditional wood details for CLASSIC design when wood theme is chosen */}
      {pieceStyle.startsWith('CLASSIC') && isWoodTheme && (
        <div className="absolute inset-1.5 rounded-full border border-amber-900/10 flex items-center justify-center pointer-events-none overflow-hidden z-2">
          <div className="w-full h-full opacity-25 relative">
            <div className="absolute inset-x-0 h-[2px] bg-red-700/80 top-[25%] rotate-12" />
            <div className="absolute inset-x-0 h-[2px] bg-red-700/80 top-[50%] rotate-12" />
            <div className="absolute inset-x-0 h-[2px] bg-red-700/80 top-[75%] rotate-12" />
            <div className="absolute inset-y-0 w-[2px] bg-red-700/80 left-[25%] -rotate-12" />
            <div className="absolute inset-y-0 w-[2px] bg-red-700/80 left-[50%] -rotate-12" />
            <div className="absolute inset-y-0 w-[2px] bg-red-700/80 left-[75%] -rotate-12" />
          </div>
        </div>
      )}

      {piece.type === 'KING' && (
        <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center pointer-events-none z-20">
          {/* Glowing pulse ring */}
          <div className={`absolute w-[75%] h-[75%] rounded-full animate-ping opacity-25 ${
            piece.player === 'CYAN' ? 'bg-cyan-400' : 'bg-amber-400'
          }`} />
          {/* Beautiful glowing Crown element with shadow and custom color mapping */}
          <Crown className={`w-[55%] h-[55%] relative z-20 animate-pulse duration-[1500ms] filter ${
            piece.player === 'CYAN'
              ? 'text-cyan-200 drop-shadow-[0_0_12px_rgba(6,182,212,0.9)] stroke-cyan-300 stroke-[2.5]'
              : 'text-amber-100 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)] stroke-amber-300 stroke-[2.5]'
          }`} />
          {/* Subtle jewel accent */}
          <span className={`absolute top-[28%] w-2 h-2 rounded-full z-25 animate-ping opacity-45 match-color ${
            piece.player === 'CYAN' ? 'bg-cyan-100 shadow-[0_0_8px_rgba(6,182,212,1)]' : 'bg-amber-100 shadow-[0_0_8px_rgba(245,158,11,1)]'
          }`} />
        </div>
      )}
    </motion.div>
  );
}
