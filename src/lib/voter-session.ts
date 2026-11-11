/**
 * Gerencia a sessão anônima do votante no navegador para identificar votos únicos
 */
export function getOrCreateVoterSessionId(): string {
  if (typeof window === 'undefined') return '';

  const STORAGE_KEY = 'beerank_voter_session_id';
  let sessionId = localStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId = 'voter_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

export function saveUserVoted(pollCode: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`beerank_voted_${pollCode.toUpperCase()}`, 'true');
}

export function hasUserVoted(pollCode: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`beerank_voted_${pollCode.toUpperCase()}`) === 'true';
}
