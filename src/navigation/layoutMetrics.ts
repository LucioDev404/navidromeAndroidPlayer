/** Layout constants for floating tab bar + mini-player spacing */
export const FLOATING_TAB_BAR_HEIGHT = 62;
export const FLOATING_TAB_BAR_BOTTOM_MARGIN = 12;
export const FLOATING_TAB_BAR_HORIZONTAL_MARGIN = 20;
export const MINI_PLAYER_HEIGHT = 58;
export const MINI_PLAYER_GAP = 8;

export function getScrollBottomInset(
  safeBottom: number,
  options?: { hasMiniPlayer?: boolean; showTabBar?: boolean },
): number {
  const showTabBar = options?.showTabBar ?? true;
  let inset = safeBottom + FLOATING_TAB_BAR_BOTTOM_MARGIN;

  if (showTabBar) {
    inset += FLOATING_TAB_BAR_HEIGHT + FLOATING_TAB_BAR_BOTTOM_MARGIN;
  } else {
    inset += FLOATING_TAB_BAR_BOTTOM_MARGIN;
  }

  if (options?.hasMiniPlayer) {
    inset += MINI_PLAYER_HEIGHT + MINI_PLAYER_GAP;
  }

  return inset;
}

/** Bottom offset for absolutely positioned global mini player. */
export function getMiniPlayerBottomOffset(
  safeBottom: number,
  options?: { showTabBar?: boolean },
): number {
  const showTabBar = options?.showTabBar ?? false;
  if (showTabBar) {
    return (
      safeBottom +
      FLOATING_TAB_BAR_BOTTOM_MARGIN +
      FLOATING_TAB_BAR_HEIGHT +
      FLOATING_TAB_BAR_BOTTOM_MARGIN +
      MINI_PLAYER_GAP
    );
  }

  return safeBottom + FLOATING_TAB_BAR_BOTTOM_MARGIN + MINI_PLAYER_GAP;
}
