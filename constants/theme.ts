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

// console.log(
//   `screens
// lg - ${SCREEN_LG},
// md - ${SCREEN_MD},
// sm - ${SCREEN_SM},
// xs - ${SCREEN_XS},
// xxs - ${SCREEN_XXS},
// `
// );
