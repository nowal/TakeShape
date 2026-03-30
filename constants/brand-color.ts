export const PRIMARY_COLOR_HSL = {
  hue: 355,
  saturation: 90,
  lightness: 40,
} as const;

export const APP_BACKGROUND_HSL = {
  hue: 40,
  saturation: 33,
  lightness: 96,
} as const;

// Secondary neutral used for tinted surfaces/cards.
// Inspired by the Base44 landing accent circle color.
export const SECONDARY_BACKGROUND_HSL = {
  hue: 150,
  saturation: 7,
  lightness: 51,
} as const;

// Keep this in sync with PRIMARY_COLOR_HSL for non-CSS APIs (e.g. map SDKs).
export const PRIMARY_COLOR_HEX = '#c20a3e';
export const APP_BACKGROUND_HEX = '#f8f4ef';
export const SECONDARY_BACKGROUND_HEX = '#7d8f80';

export const PRIMARY_COLOR_CSS = `hsl(${PRIMARY_COLOR_HSL.hue} ${PRIMARY_COLOR_HSL.saturation}% ${PRIMARY_COLOR_HSL.lightness}%)`;
export const APP_BACKGROUND_CSS = `hsl(${APP_BACKGROUND_HSL.hue} ${APP_BACKGROUND_HSL.saturation}% ${APP_BACKGROUND_HSL.lightness}%)`;
export const SECONDARY_BACKGROUND_CSS = `hsl(${SECONDARY_BACKGROUND_HSL.hue} ${SECONDARY_BACKGROUND_HSL.saturation}% ${SECONDARY_BACKGROUND_HSL.lightness}%)`;
