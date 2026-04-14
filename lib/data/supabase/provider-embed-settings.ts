import { supabaseServer } from '@/lib/supabase/server';
import {
  DEFAULT_INTAKE_EMBED_SETTINGS,
  IntakeEmbedSettings,
  normalizeIntakeEmbedSettings,
} from '@/app/embed/intake/settings';

export const getProviderIntakeEmbedSettingsSupabase = async (
  providerId: string
): Promise<IntakeEmbedSettings> => {
  const { data, error } = await supabaseServer
    .from('provider_embed_settings')
    .select('intake_settings')
    .eq('provider_id', providerId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return DEFAULT_INTAKE_EMBED_SETTINGS;

  return normalizeIntakeEmbedSettings(data.intake_settings);
};

export const upsertProviderIntakeEmbedSettingsSupabase = async ({
  providerId,
  intakeSettings,
}: {
  providerId: string;
  intakeSettings: IntakeEmbedSettings;
}) => {
  const { data, error } = await supabaseServer
    .from('provider_embed_settings')
    .upsert(
      {
        provider_id: providerId,
        intake_settings: intakeSettings,
      },
      { onConflict: 'provider_id' }
    )
    .select('provider_id,intake_settings')
    .single();

  if (error) throw error;
  return data;
};
