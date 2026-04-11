export const PRIMARY_COLOR_HSL = {
  hue: 355,
  saturation: 90,
  lightness: 40,
} as const;

export const PRIMARY_HOVER_COLOR_HSL = {
  hue: 355,
  saturation: 91,
  lightness: 22,
} as const;

export const APP_BACKGROUND_HSL = {
  hue: 40,
  saturation: 27,
  lightness: 98,
} as const;

// Secondary neutral used for tinted surfaces/cards.
// Mirrors the Webflow landing's neutral-200.
export const SECONDARY_BACKGROUND_HSL = {
  hue: 38,
  saturation: 21,
  lightness: 93,
} as const;

// Keep this in sync with PRIMARY_COLOR_HSL for non-CSS APIs (e.g. map SDKs).
export const PRIMARY_COLOR_HEX = '#c20a19';
export const PRIMARY_HOVER_COLOR_HEX = '#6b050d';
export const APP_BACKGROUND_HEX = '#fbfaf8';
export const SECONDARY_BACKGROUND_HEX = '#f0ede8';

export const PRIMARY_COLOR_CSS = `hsl(${PRIMARY_COLOR_HSL.hue} ${PRIMARY_COLOR_HSL.saturation}% ${PRIMARY_COLOR_HSL.lightness}%)`;
export const PRIMARY_HOVER_COLOR_CSS = `hsl(${PRIMARY_HOVER_COLOR_HSL.hue} ${PRIMARY_HOVER_COLOR_HSL.saturation}% ${PRIMARY_HOVER_COLOR_HSL.lightness}%)`;
export const APP_BACKGROUND_CSS = `hsl(${APP_BACKGROUND_HSL.hue} ${APP_BACKGROUND_HSL.saturation}% ${APP_BACKGROUND_HSL.lightness}%)`;
export const SECONDARY_BACKGROUND_CSS = `hsl(${SECONDARY_BACKGROUND_HSL.hue} ${SECONDARY_BACKGROUND_HSL.saturation}% ${SECONDARY_BACKGROUND_HSL.lightness}%)`;

export const BRAND_FONT_FALLBACK_STACK =
  'Barlow, Arial, sans-serif';
