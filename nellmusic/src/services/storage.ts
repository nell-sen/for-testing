const BLOCKED_KEY = 'nm_blocked_count';

export const incrementBlockedCount = (n: number) => {
  const current = parseInt(localStorage.getItem(BLOCKED_KEY) || '0');
  localStorage.setItem(BLOCKED_KEY, String(current + n));
};

export const getBlockedCount = (): number => {
  return parseInt(localStorage.getItem(BLOCKED_KEY) || '0');
};
