export type TPaintBrand = {
  id: string;
  name: string;
  count: number;
};

export type TColor = {
  id: string;
  name: string;
  brand: string;
};

export type TPreferencesColorConfig = {
  dispatchPreferences: any;
};
