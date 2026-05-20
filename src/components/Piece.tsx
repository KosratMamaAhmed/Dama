import { motion } from 'motion/react';
import { Crown } from 'lucide-react';
import { Piece as PieceType, BoardTheme } from '../types';

interface PieceProps {
  piece: PieceType;
  isSelected?: boolean;
  theme?: BoardTheme;
}

export default function Piece({ piece, isSelected, theme }: PieceProps) {
  const isCyan = piece.player === 'CYAN';
  const isWoodTheme = theme === 'KURDISH_WOOD';

  let baseStyle = '';
  if (isWoodTheme) {
    baseStyle = isCyan
      ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900 via-amber-950 to-stone-950 border-2 border-amber-600/50 shadow-[inset_0_-4px_10px_rgba(0,0,0,0.85),_0_6px_20px_rgba(0,0,0,0.6)] text-cyan-300'
      : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-100 via-amber-200 to-amber-300 border-2 border-amber-500/40 shadow-[inset_0_-4px_10px_rgba(0,0,0,0.3),_0_6px_20px_rgba(0,0,0,0.4)] text-amber-950';
  } else {
    baseStyle = isCyan
      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border border-cyan-300/50 shadow-[inset_0_-2px_10px_rgba(0,0,0,0.3),_0_4px_15px_rgba(34,211,238,0.4)] text-white'
      : 'bg-gradient-to-br from-slate-100 to-slate-400 border border-white/80 shadow-[inset_0_-2px_10px_rgba(0,0,0,0.2),_0_4px_15px_rgba(255,255,255,0.4)] text-slate-800';
  }

  const glowStyle = isSelected
    ? isCyan
      ? 'shadow-[0_0_25px_rgba(34,211,238,0.9)] scale-110 ring-4 ring-cyan-200/50'
      : 'shadow-[0_0_25px_rgba(255,255,255,0.9)] scale-110 ring-4 ring-white/50'
    : 'hover:scale-105';

  return (
    <motion.div
      layout
      layoutId={piece.id}
      className={`relative w-[77%] h-[77%] rounded-full flex items-center justify-center transition-all duration-300 ease-out z-10 ${baseStyle} ${glowStyle}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isSelected ? 1.15 : 1, opacity: 1 }}
      whileHover={{ scale: isSelected ? 1.15 : 1.1 }}
    >
      {/* 3D Ring Effect */}
      <div className={`absolute inset-2 rounded-full border pointer-events-none ${isWoodTheme ? 'border-amber-500/20' : 'border-white/20'}`} />
      
      {/* Traditional Wood Details inside the pieces */}
      {isWoodTheme ? (
        isCyan ? (
          /* Handcrafted Dark Wood Medallion with Kurdish Sun Icon */
          <div className="absolute inset-1.5 rounded-full border border-amber-500/10 flex items-center justify-center pointer-events-none">
            <div className="w-[65%] h-[65%] rounded-full bg-gradient-to-br from-cyan-500/25 to-blue-800/15 border border-cyan-500/30 flex items-center justify-center shadow-inner">
              {/* Kurdish Red/Orange/Yellow Sun Emitting Rays */}
              <div className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_6px_#f59e0b] flex items-center justify-center">
                <div className="w-1 h-1 bg-red-500 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          /* Handcrafted Light Wood Piece with traditional check ribbon (similar to Kurdish Jamana) */
          <div className="absolute inset-1.5 rounded-full border border-amber-900/10 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="w-full h-full opacity-35 relative">
              {/* Jamana-inspired diagonal intersecting threads */}
              <div className="absolute inset-x-0 h-[2px] bg-red-700/80 top-[25%] rotate-12" />
              <div className="absolute inset-x-0 h-[2px] bg-red-700/80 top-[50%] rotate-12" />
              <div className="absolute inset-x-0 h-[2px] bg-red-700/80 top-[75%] rotate-12" />
              <div className="absolute inset-y-0 w-[2px] bg-red-700/80 left-[25%] -rotate-12" />
              <div className="absolute inset-y-0 w-[2px] bg-red-700/80 left-[50%] -rotate-12" />
              <div className="absolute inset-y-0 w-[2px] bg-red-700/80 left-[75%] -rotate-12" />
            </div>
            {/* Center traditional concentric rings */}
            <div className="absolute w-[45%] h-[45%] rounded-full border border-amber-900/40 bg-amber-200/50 flex items-center justify-center">
              <div className="w-[50%] h-[50%] bg-amber-800/25 rounded-full" />
            </div>
          </div>
        )
      ) : (
        /* Highlight reflection for glossy modern marble theme */
        <div className="absolute top-[10%] left-[15%] w-[30%] h-[30%] bg-white/30 rounded-full blur-[2px] pointer-events-none" />
      )}

      {piece.type === 'KING' && (
        <Crown className="w-[55%] h-[55%] text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-20 animate-pulse" />
      )}
    </motion.div>
  );
}
