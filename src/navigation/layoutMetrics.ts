/** Layout constants for floating tab bar + mini-player spacing */
export const FLOATING_TAB_BAR_HEIGHT = 62;
export const FLOATING_TAB_BAR_BOTTOM_MARGIN = 12;
export const FLOATING_TAB_BAR_HORIZONTAL_MARGIN = 20;
export const MINI_PLAYER_HEIGHT = 58;
export const MINI_PLAYER_GAP = 8;

export function getScrollBottomInset(
  safeBottom: number,
  options?: { hasMiniPlayer?: boolean },
): number {
  let inset =
    safeBottom +
    FLOATING_TAB_BAR_BOTTOM_MARGIN +
    FLOATING_TAB_BAR_HEIGHT +
    FLOATING_TAB_BAR_BOTTOM_MARGIN;

  if (options?.hasMiniPlayer) {
    inset += MINI_PLAYER_HEIGHT + MINI_PLAYER_GAP;
  }

  return inset;
}
