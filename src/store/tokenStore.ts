export function getTokens(): number {
  const t = localStorage.getItem('dama_tokens');
  const zeroTime = localStorage.getItem('dama_zero_tokens_time');

  if (zeroTime) {
    const elapsed = Date.now() - parseInt(zeroTime, 10);
    if (elapsed >= 3600000) {
      // 1 hour has passed! Reset tokens to 40
      localStorage.removeItem('dama_zero_tokens_time');
      localStorage.setItem('dama_tokens', '40');
      return 40;
    }
    // Still in 1 hour cooldown, force returning 0
    return 0;
  }

  if (t !== null && parseInt(t, 10) <= 0) {
    localStorage.setItem('dama_zero_tokens_time', Date.now().toString());
    return 0;
  }

  if (!t) {
    saveTokens(100);
    return 100;
  }
  return parseInt(t, 10);
}

export function saveTokens(tokens: number) {
  const normalized = Math.max(0, tokens);
  localStorage.setItem('dama_tokens', normalized.toString());
  
  if (normalized <= 0) {
    if (!localStorage.getItem('dama_zero_tokens_time')) {
      localStorage.setItem('dama_zero_tokens_time', Date.now().toString());
    }
  } else {
    // If they got tokens above 0, and the hour block is not active or they legitimately got replenished
    // But wait! We only clear zeroTime if the hour has passed or if we explicitly cleared it.
    // If they manually try to add tokens somehow, we shouldn't allow bypassing the lock
    const zeroTime = localStorage.getItem('dama_zero_tokens_time');
    if (zeroTime) {
      const elapsed = Date.now() - parseInt(zeroTime, 10);
      if (elapsed >= 3600000) {
        localStorage.removeItem('dama_zero_tokens_time');
      }
    }
  }
}

export function getZeroTokensTime(): number | null {
  const t = localStorage.getItem('dama_zero_tokens_time');
  if (!t) return null;
  // If the time has already passed, clear it and return null
  const parsed = parseInt(t, 10);
  if (Date.now() - parsed >= 3600000) {
    localStorage.removeItem('dama_zero_tokens_time');
    localStorage.setItem('dama_tokens', '40');
    return null;
  }
  return parsed;
}

export function addWinTokens() {
  saveTokens(getTokens() + 5);
}

export function deductLossTokens() {
  saveTokens(Math.max(0, getTokens() - 10));
}

export function deductEntryTokens() {
  saveTokens(Math.max(0, getTokens() - 2));
}

export function claimHourlyTokens(): number | null {
  // If they are locked in 0-token cooldown, do not allow normal bonus claim to bypass it
  const zeroTime = localStorage.getItem('dama_zero_tokens_time');
  if (zeroTime) {
    const elapsed = Date.now() - parseInt(zeroTime, 10);
    if (elapsed < 3600000) {
      return null;
    } else {
      localStorage.removeItem('dama_zero_tokens_time');
      localStorage.setItem('dama_tokens', '40');
      return 40;
    }
  }

  const lastClaim = localStorage.getItem('dama_last_claim');
  const now = Date.now();
  if (!lastClaim || now - parseInt(lastClaim) > 3600000) {
    localStorage.setItem('dama_last_claim', now.toString());
    const current = getTokens();
    const nextVal = current + 40;
    saveTokens(nextVal);
    return 40;
  }
  return null;
}
