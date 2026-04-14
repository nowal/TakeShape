const parseBoolean = (
  rawValue: string | undefined,
  fallback: boolean
) => {
  if (!rawValue) return fallback;
  const normalized = rawValue.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return fallback;
};

export const isSupabaseDataLayerEnabled = () =>
  parseBoolean(process.env.USE_SUPABASE_DATA_LAYER, false);

export const shouldCopySignalWireRecordingsToR2 = () =>
  parseBoolean(process.env.COPY_SIGNALWIRE_RECORDINGS_TO_R2, true);

export const shouldInlineCopySignalWireToR2 = () =>
  parseBoolean(process.env.INLINE_R2_COPY_ON_FINALIZE, false);
