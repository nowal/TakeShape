import defaultTheme from 'tailwindcss/defaultTheme';

export const SCREEN_LG = Number(
  defaultTheme.screens.lg.replace('px', '')
);
export const SCREEN_MD = Number(
  defaultTheme.screens.md.replace('px', '')
);
export const SCREEN_SM = Number(
  defaultTheme.screens.sm.replace('px', '')
);
export const SCREEN_XS = 450;
export const SCREEN_XXS = 375;

console.log(
  SCREEN_LG,
  SCREEN_MD,
  SCREEN_SM,
  SCREEN_XS,
  SCREEN_XXS
);
