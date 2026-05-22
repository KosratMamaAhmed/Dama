import { useCallback, useRef } from 'react';

export function useDropSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: 'move' | 'capture' | 'win' | 'error' | 'king' = 'move') => {
    try {
      // Trigger native Android haptic vibration feedback for gaming physics feedback
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        if (type === 'move') {
          window.navigator.vibrate(18);
        } else if (type === 'capture') {
          window.navigator.vibrate([25, 35, 25]);
        } else if (type === 'king') {
          window.navigator.vibrate([20, 30, 20, 40]);
        } else if (type === 'win') {
          window.navigator.vibrate([120, 60, 120, 60, 180]);
        } else if (type === 'error') {
          window.navigator.vibrate(75);
        }
      }

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioCtx = audioCtxRef.current;
      
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (type === 'win') {
        // High-quality Royal Folk Victory fanfare
        const notes = [440, 554, 659, 880, 1109]; // Kurdish major scale notes
        notes.forEach((freq, index) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.1);
          
          gain.gain.setValueAtTime(0, audioCtx.currentTime + index * 0.1);
          gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + index * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + index * 0.1 + 0.3);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + index * 0.1);
          osc.stop(audioCtx.currentTime + index * 0.1 + 0.4);
        });
      } else if (type === 'king') {
        // Celestial metallic wind sweep chime for King promotions!
        const sweepRates = [600, 800, 1000, 1300, 1600];
        sweepRates.forEach((freq, index) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.07);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + index * 0.07 + 0.12);
          
          gain.gain.setValueAtTime(0, audioCtx.currentTime + index * 0.07);
          gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + index * 0.07 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + index * 0.07 + 0.15);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + index * 0.07);
          osc.stop(audioCtx.currentTime + index * 0.07 + 0.2);
        });
      } else if (type === 'capture') {
        // Wood pieces clattering (Double-knock impact simulation)
        // Primary impact body
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(120, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.12);
        
        gain1.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.12);

        // High frequency click crack
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(900, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.06);
        
        gain2.gain.setValueAtTime(0.35, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
        
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.07);
        
        // Secondary bouncing clack
        const osc3 = audioCtx.createOscillator();
        const gain3 = audioCtx.createGain();
        osc3.type = 'triangle';
        osc3.frequency.setValueAtTime(350, audioCtx.currentTime + 0.05);
        osc3.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.13);
        
        gain3.gain.setValueAtTime(0.25, audioCtx.currentTime + 0.05);
        gain3.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.13);
        
        osc3.connect(gain3);
        gain3.connect(audioCtx.destination);
        osc3.start(audioCtx.currentTime + 0.05);
        osc3.stop(audioCtx.currentTime + 0.14);
      } else if (type === 'error') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        osc.frequency.setValueAtTime(110, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.16);
      } else {
        // Standard Move - Clean woody slide-knock thud
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(260, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.08);
        
        gain1.gain.setValueAtTime(0.65, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.09);

        // High frequency clack transient (to sound like solid polished walnut wood)
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1100, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.03);
        
        gain2.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.04);
      }
    } catch (e) {
      // Ignored if AudioContext is not supported
    }
  }, []);

  return playSound;
}
