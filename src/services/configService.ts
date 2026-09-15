import { DenominationalLens, DENOMINATIONS } from '../data/theologyData';

export type UserDenominationSetting = DenominationalLens | 'all' | 'none';

export const USER_DENOMINATION_KEY = 'berea_user_denomination_preference';

/**
 * Normalizes any denomination string (e.g. "Roman Catholic", "Reformed", "all", "none")
 * to the canonical UserDenominationSetting.
 */
export function normalizeUserDenomination(val?: string | null): UserDenominationSetting {
  if (!val) return 'catholic'; // Default fallback
  const clean = val.trim().toLowerCase();

  if (clean === 'all' || clean === 'none') {
    return clean;
  }

  // Common aliases and abbreviations
  if (clean.includes('catholic')) return 'catholic';
  if (clean.includes('orthodox')) return 'orthodox';
  if (clean.includes('reformed') || clean.includes('presbyterian') || clean.includes('calvin')) return 'reformed';
  if (clean.includes('lutheran')) return 'lutheran';
  if (clean.includes('wesley') || clean.includes('methodist')) return 'wesleyan';
  if (clean.includes('anglican') || clean.includes('episcopal')) return 'anglican';
  if (clean.includes('baptist') || clean.includes('evangelical')) return 'baptist_evangelical';

  // Check matching denomination ID directly
  const byId = DENOMINATIONS.find(d => d.id.toLowerCase() === clean);
  if (byId) return byId.id;

  // Check matching denomination display name (e.g. "Roman Catholic", "Reformed & Presbyterian")
  const byName = DENOMINATIONS.find(
    d => d.name.toLowerCase() === clean ||
         d.traditionGroup.toLowerCase() === clean ||
         d.name.toLowerCase().includes(clean)
  );
  if (byName) return byName.id;

  return 'catholic';
}

/**
 * Retrieves the global user denomination preference from localStorage or environment fallback.
 */
export function getUserDenominationPreference(): UserDenominationSetting {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem(USER_DENOMINATION_KEY);
    if (stored) {
      return normalizeUserDenomination(stored);
    }
  }

  // Fallback to import.meta.env if defined
  const envVal = (import.meta as any).env?.VITE_USER_DENOMINATION;
  return normalizeUserDenomination(envVal);
}

/**
 * Persists the global user denomination preference.
 */
export function setUserDenominationPreference(preference: UserDenominationSetting | string): void {
  const normalized = normalizeUserDenomination(preference);
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(USER_DENOMINATION_KEY, normalized);
  }
}

/**
 * Returns human-readable label for the preference (e.g. "Roman Catholic", "All Traditions", "None").
 */
export function getDenominationLabel(preference: UserDenominationSetting): string {
  if (preference === 'all') return 'All Traditions (Ecumenical)';
  if (preference === 'none') return 'None (Neutral)';
  const denom = DENOMINATIONS.find(d => d.id === preference);
  return denom ? denom.name : preference;
}
