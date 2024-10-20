import { TPreferencesNameBooleansKey } from "@/atom/types";

export type TPaintPreferencesFlags = Record<
  TPreferencesNameBooleansKey,
  boolean
>;
export type TPaintPreferences =
  Partial<TPaintPreferencesFlags> & {
    color?: string;
    finish?: string;
    ceilingColor?: string;
    ceilingFinish?: string;
    trimColor?: string;
    trimFinish?: string;
    paintQuality?: string;
  };