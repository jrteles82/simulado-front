export const MOBILE_MAX_WIDTH = 767.98;

function matchMediaQuery(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(query).matches;
}

export function isMobileViewport(maxWidth: number = MOBILE_MAX_WIDTH): boolean {
  return matchMediaQuery(`(max-width: ${maxWidth}px)`);
}

export function isMobilePortrait(maxWidth: number = MOBILE_MAX_WIDTH): boolean {
  return matchMediaQuery(`(max-width: ${maxWidth}px) and (orientation: portrait)`);
}

export function isMobileLandscape(maxWidth: number = MOBILE_MAX_WIDTH): boolean {
  return matchMediaQuery(`(max-width: ${maxWidth}px) and (orientation: landscape)`);
}
