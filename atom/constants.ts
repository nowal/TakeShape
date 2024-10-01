export const PREFERENCES_NAME_BOOLEAN_CEILINGS = 'ceilings';
export const PREFERENCES_NAME_BOOLEAN_TRIM = 'trim';
export const PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL =
  'laborAndMaterial';
export const PREFERENCES_NAME_BOOLEAN_MOVE_FURNITURE =
  'moveFurniture';

export const PREFERENCES_NAME_STRING_COLOR = 'color';
export const PREFERENCES_NAME_STRING_CEILING_COLOR =
  'ceilingColor';
export const PREFERENCES_NAME_STRING_TRIM_COLOR =
  'trimColor';

export const PREFERENCES_NAME_BOOLEANS = [
  PREFERENCES_NAME_BOOLEAN_CEILINGS,
  PREFERENCES_NAME_BOOLEAN_TRIM,
  PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL,
] as const;

export const PREFERENCES_NAME_STRING_COLORS = [
  PREFERENCES_NAME_STRING_COLOR,
  PREFERENCES_NAME_STRING_CEILING_COLOR,
  PREFERENCES_NAME_STRING_TRIM_COLOR,
] as const;

const PREFERENCES_COLOR_RECORD = {
  [PREFERENCES_NAME_STRING_COLOR]: '',
  [PREFERENCES_NAME_STRING_CEILING_COLOR]: 'White',
  [PREFERENCES_NAME_STRING_TRIM_COLOR]: 'White',
};

export const PAINT_PREFERENCES_DEFAULTS = {
  [PREFERENCES_NAME_BOOLEAN_CEILINGS]: false,
  [PREFERENCES_NAME_BOOLEAN_TRIM]: false,
  [PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL]: false,
  finish: 'Eggshell',
  paintQuality: 'Medium',
  ceilingFinish: 'Flat',
  trimFinish: 'Semi-gloss',
  ...PREFERENCES_COLOR_RECORD,
} as const;

export const UPLOAD_STATUS_RECORD = {
  idle: 'idle',
  uploading: 'uploading',
  completed: 'completed',
  error: 'error',
} as const;

export const PREFERENCES_COLOR_BRAND_RECORD = {
  [PREFERENCES_NAME_STRING_COLOR]: '',
  [PREFERENCES_NAME_STRING_CEILING_COLOR]: '',
  [PREFERENCES_NAME_STRING_TRIM_COLOR]: '',
} as const;
