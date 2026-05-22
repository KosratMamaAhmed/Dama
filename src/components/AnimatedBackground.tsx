import React from 'react';
import { motion } from 'motion/react';

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
      {/* High-visibility authentic classic retro Dama/Checkers wooden board grid covering the full background */}
      <div 
        className="absolute inset-0 classic-wood-dama-back opacity-[0.85]" 
        style={{
          boxShadow: 'inset 0 0 300px rgba(0, 0, 0, 0.95)'
        }}
      />
      
      {/* Interactive moving overlay of sleek geometric light blue checkers line cells for a 3D overlay feel */}
      <div 
        className="absolute inset-0 opacity-25" 
        style={{
          backgroundImage: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.15) 0%, transparent 80%)',
        }}
      />
      
      {/* Real-time moving checkers pattern layer to add life */}
      <div className="absolute inset-0 animated-checkers opacity-25" />
      
      {/* Floating 3D authentic polished round checkers drifting elegantly in background */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-amber-300/30"
          style={{
            width: `${i % 2 === 0 ? 38 : 50}px`,
            height: `${i % 2 === 0 ? 38 : 50}px`,
            background: i % 2 === 0 
              ? 'radial-gradient(circle at 35% 35%, #06b6d4 10%, #0891b2 50%, #0c4a6e 100%)' 
              : 'radial-gradient(circle at 35% 35%, #fbbf24 15%, #d97706 55%, #451a03 100%)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.65), inset 2px 2px 4px rgba(255,255,255,0.4)',
            top: `${15 + i * 16}%`,
            left: `${10 + (i * 24) % 80}%`,
            opacity: 0.45,
          }}
          animate={{
            y: [0, -35, 0],
            x: [0, 22, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 18 + i * 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Vignette cover for exquisite focus on the main gameplay element */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.4)_60%,rgba(1,10,24,0.92)_100%)]" />
      
      {/* Sky-blue ambient spotlight from top */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.32)_0%,transparent_75%)]" />
    </div>
  );
}
