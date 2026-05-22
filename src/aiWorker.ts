/// <reference lib="webworker" />
import { getAIMove } from './ai';

self.addEventListener('message', (e) => {
  const { board, difficulty, turn, mustJumpPos } = e.data;
  
  // Calculate move
  const move = getAIMove(board, difficulty, turn, mustJumpPos);
  
  // Send back
  self.postMessage({ move });
});
