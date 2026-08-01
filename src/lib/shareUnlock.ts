const SHARE_UNLOCK_KEY = "valorant_share_unlock";
const UNLOCK_DURATION = 30 * 60 * 1000;

export interface ShareUnlock { expiresAt: string; }

export function grantShareUnlock(): ShareUnlock {
  const reward = { expiresAt: new Date(Date.now() + UNLOCK_DURATION).toISOString() };
  localStorage.setItem(SHARE_UNLOCK_KEY, JSON.stringify(reward));
  return reward;
}

export function readShareUnlock(): ShareUnlock | null {
  try {
    const reward = JSON.parse(localStorage.getItem(SHARE_UNLOCK_KEY) ?? "null") as ShareUnlock | null;
    if (!reward || new Date(reward.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(SHARE_UNLOCK_KEY);
      return null;
    }
    return reward;
  } catch {
    localStorage.removeItem(SHARE_UNLOCK_KEY);
    return null;
  }
}
