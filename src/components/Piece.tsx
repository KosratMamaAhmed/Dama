import React from 'react';
import { Crown } from 'lucide-react';
import { Piece as PieceType } from '../types';

interface PieceProps {
  piece: PieceType;
  styleType?: string;
}

export default function Piece({ piece, styleType = 'CLASSIC' }: PieceProps) {
  let pieceClass = '';
  
  switch (styleType) {
    case 'BLACK_WHITE':
      pieceClass = piece.player === 'CYAN' 
        ? 'bg-gradient-to-br from-stone-800 to-black shadow-lg border-stone-600' 
        : 'bg-gradient-to-br from-gray-100 to-gray-300 shadow-lg border-white';
      break;
    case 'GOLD_BLACK':
      pieceClass = piece.player === 'CYAN' 
        ? 'bg-gradient-to-br from-yellow-300 to-amber-600 shadow-lg border-yellow-200' 
        : 'bg-gradient-to-br from-stone-800 to-black shadow-lg border-stone-600';
      break;
    case 'NEON_GLOW':
      pieceClass = piece.player === 'CYAN' 
        ? 'bg-slate-900 shadow-[0_0_10px_#22d3ee,inset_0_0_10px_#22d3ee] border-cyan-400' 
        : 'bg-slate-900 shadow-[0_0_10px_#f43f5e,inset_0_0_10px_#f43f5e] border-rose-400';
      break;
    case 'WOODEN':
      pieceClass = piece.player === 'CYAN' 
        ? 'bg-[#5c4033] shadow-[inset_0_-4px_6px_rgba(0,0,0,0.6)] border-[#3e2723]' 
        : 'bg-[#d7ccc8] shadow-[inset_0_-4px_6px_rgba(0,0,0,0.3)] border-[#a1887f]';
      break;
    case 'CLASSIC':
    default:
      pieceClass = piece.player === 'CYAN' 
        ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.5)] border-cyan-300' 
        : 'bg-gradient-to-br from-slate-100 to-slate-400 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.5)] border-white';
      break;
  }

  return (
    <div className={`
      relative w-[85%] h-[85%] rounded-full border-2 
      flex items-center justify-center 
      ${pieceClass}
    `}>
      <div className={`absolute inset-1 rounded-full border ${styleType === 'NEON_GLOW' ? 'border-transparent' : 'border-white/20'}`} />
      
      {piece.type === 'KING' && (
        <Crown className={`
          w-[60%] h-[60%] drop-shadow-md
          ${piece.player === 'CYAN' && styleType !== 'NEON_GLOW' ? 'text-amber-300' : ''}
          ${piece.player === 'WHITE' && styleType !== 'NEON_GLOW' ? 'text-amber-500' : ''}
          ${styleType === 'NEON_GLOW' && piece.player === 'CYAN' ? 'text-cyan-400' : ''}
          ${styleType === 'NEON_GLOW' && piece.player === 'WHITE' ? 'text-rose-400' : ''}
        `} />
      )}
    </div>
  );
}