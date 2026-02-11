export const PRIMARY_COLOR_HSL = {
  hue: 345,
  saturation: 90,
  lightness: 37,
} as const;

// Keep this in sync with PRIMARY_COLOR_HSL for non-CSS APIs (e.g. map SDKs).
export const PRIMARY_COLOR_HEX = '#c20a3e';

export const PRIMARY_COLOR_CSS = `hsl(${PRIMARY_COLOR_HSL.hue} ${PRIMARY_COLOR_HSL.saturation}% ${PRIMARY_COLOR_HSL.lightness}%)`;
