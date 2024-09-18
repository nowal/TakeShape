export const PREFERENCES_NAME_BOOLEAN_CEILINGS = 'ceilings';
export const PREFERENCES_NAME_BOOLEAN_TRIM = 'trim';
export const PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL =
  'laborAndMaterial';
export const PREFERENCES_NAME_BOOLEAN_MOVE_FURNITURE =
  'moveFurniture';
export const PREFERENCES_NAME_BOOLEANS = [
  PREFERENCES_NAME_BOOLEAN_CEILINGS,
  PREFERENCES_NAME_BOOLEAN_TRIM,
  PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL,
] as const;
export const PAINT_PREFERENCES_DEFAULTS = {
  ceilings: false,
  trim: false,
  color: '',
  finish: 'Eggshell',
  paintQuality: 'Medium',
  ceilingColor: 'White',
  ceilingFinish: 'Flat',
  trimColor: 'White',
  trimFinish: 'Semi-gloss',
} as const;
export const UPLOAD_STATUS_RECORD = {
  idle: 'idle',
  uploading: 'uploading',
  completed: 'completed',
  error: 'error',
} as const;
