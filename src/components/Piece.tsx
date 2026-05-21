import React from 'react';
import { Crown } from 'lucide-react';
import { Piece as PieceType } from '../types';

interface PieceProps {
  piece: PieceType;
  styleType: string;
}

export default function Piece({ piece, styleType }: PieceProps) {
  // دیاریکردنی ستایلی بەردەکان بەپێی هەڵبژاردەی یاریزان
  let pieceClass = '';
  
  if (styleType === 'CLASSIC') {
    pieceClass = piece.player === 'CYAN' 
      ? 'bg-gradient-to-br from-cyan-300 to-cyan-600 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.5)] border-cyan-400' 
      : 'bg-gradient-to-br from-slate-100 to-slate-400 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.5)] border-white';
  } else if (styleType === 'BLACK_WHITE') {
    pieceClass = piece.player === 'CYAN' 
      ? 'bg-gradient-to-br from-stone-700 to-black shadow-lg border-stone-600' 
      : 'bg-gradient-to-br from-gray-100 to-gray-300 shadow-lg border-white';
  } else if (styleType === 'GOLD_BLACK') {
    pieceClass = piece.player === 'CYAN' 
      ? 'bg-gradient-to-br from-yellow-300 to-amber-600 shadow-lg border-yellow-200' 
      : 'bg-gradient-to-br from-stone-800 to-black shadow-lg border-stone-600';
  } else {
    // ستایلی بنەڕەتی گەر هیچ کامیان نەبوو
    pieceClass = piece.player === 'CYAN' 
      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md border-cyan-300' 
      : 'bg-gradient-to-br from-slate-200 to-slate-500 shadow-md border-white';
  }

  return (
    <div className={`relative w-[80%] h-[80%] rounded-full border-2 flex items-center justify-center transition-transform hover:scale-105 ${pieceClass}`}>
      {/* چەمپەرەی ناوەوە بۆ جوانی */}
      <div className="absolute inset-1 rounded-full border border-white/20" />
      
      {/* ئەگەر بەردەکە بووە شا (King) */}
      {piece.type === 'KING' && (
        <Crown className={`w-[60%] h-[60%] ${piece.player === 'CYAN' ? 'text-amber-300' : 'text-amber-500'} drop-shadow-md`} />
      )}
    </div>
  );
}