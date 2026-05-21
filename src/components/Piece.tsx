import React, { useMemo } from 'react';
import { Crown } from 'lucide-react';

export default function Piece({ piece, styleType = 'WHITE_BLACK' }: any) {
  
  // لۆجیکی ناڕێککردنی شێوەی بەردەکان (بە شێوەیەکی هەڕەمەکی بۆ هەر بەردێک)
  const stoneShape = useMemo(() => {
    const shapes = [
      '40% 60% 70% 30% / 40% 50% 60% 50%',
      '50% 50% 30% 70% / 60% 30% 70% 40%',
      '30% 70% 50% 50% / 50% 60% 40% 50%',
      '60% 40% 60% 40% / 40% 60% 40% 60%',
      '45% 55% 40% 60% / 55% 45% 60% 40%'
    ];
    // بەکارهێنانی IDی بەردەکە بۆ دیاریکردنی شێوەکەی بۆ ئەوەی جێگیر بێت کاتی جوڵان
    let num = 0;
    for (let i = 0; i < piece.id.length; i++) num += piece.id.charCodeAt(i);
    return shapes[num % shapes.length];
  }, [piece.id]);

  let pieceClass = '';
  
  switch (styleType) {
    case 'WHITE_BLACK': // سپی تۆخ و ڕەش
      pieceClass = piece.player === 'CYAN' 
        ? 'bg-gradient-to-br from-white via-gray-100 to-gray-300 shadow-[inset_-3px_-5px_10px_rgba(0,0,0,0.3),3px_5px_8px_rgba(0,0,0,0.4)] border-gray-400' 
        : 'bg-gradient-to-br from-gray-700 via-gray-900 to-black shadow-[inset_-3px_-5px_10px_rgba(255,255,255,0.15),3px_5px_8px_rgba(0,0,0,0.6)] border-gray-950 text-white';
      break;
    case 'GOLD_BLACK': // گۆڵد و ڕەش
      pieceClass = piece.player === 'CYAN' 
        ? 'bg-gradient-to-br from-yellow-200 via-amber-500 to-yellow-700 shadow-[inset_-3px_-5px_10px_rgba(0,0,0,0.4),3px_5px_8px_rgba(0,0,0,0.5)] border-yellow-600' 
        : 'bg-gradient-to-br from-gray-800 to-black shadow-[inset_-3px_-5px_10px_rgba(255,255,255,0.1),3px_5px_8px_rgba(0,0,0,0.6)] border-black text-white';
      break;
    case 'RUBY_EMERALD': // بەردی سەوز و سور
      pieceClass = piece.player === 'CYAN' 
        ? 'bg-gradient-to-br from-emerald-400 to-emerald-800 shadow-[inset_-2px_-5px_10px_rgba(0,0,0,0.5),2px_4px_6px_rgba(0,0,0,0.4)] border-emerald-600' 
        : 'bg-gradient-to-br from-rose-400 to-rose-800 shadow-[inset_-2px_-5px_10px_rgba(0,0,0,0.5),2px_4px_6px_rgba(0,0,0,0.4)] border-rose-600 text-white';
      break;
    case 'WOODEN_ROCK': // بەردی تەختە و قاوەیی
      pieceClass = piece.player === 'CYAN' 
        ? 'bg-[#e6c280] shadow-[inset_-3px_-5px_8px_rgba(0,0,0,0.4),3px_5px_6px_rgba(0,0,0,0.3)] border-[#b89554]' 
        : 'bg-[#5c4033] shadow-[inset_-3px_-5px_8px_rgba(0,0,0,0.6),3px_5px_6px_rgba(0,0,0,0.5)] border-[#3e2723] text-white';
      break;
    default:
      pieceClass = piece.player === 'CYAN' 
        ? 'bg-gradient-to-br from-white to-gray-300 shadow-md border-gray-400' 
        : 'bg-gradient-to-br from-gray-800 to-black shadow-md border-gray-900 text-white';
      break;
  }

  return (
    <div 
      style={{ borderRadius: stoneShape }} 
      className={`
        relative w-[85%] h-[85%] border-2 
        flex items-center justify-center 
        ${pieceClass}
      `}
    >
      {/* درەوشانەوەی ناوەوە بۆ ئەوەی وەک بەردی سروشتی دەرکەوێت */}
      <div style={{ borderRadius: stoneShape }} className="absolute inset-1 border border-white/10" />
      
      {piece.type === 'KING' && (
        <Crown className={`w-[60%] h-[60%] drop-shadow-lg ${piece.player === 'CYAN' && styleType === 'WHITE_BLACK' ? 'text-amber-500' : 'text-amber-300'}`} />
      )}
    </div>
  );
}