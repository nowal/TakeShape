export type TRange = {
  from: number;
  to: number;
};

export type TDimensions = {
  width: number;
  height: number;
};

export type TDimensionsReady =
  TDimensions & {
    isDimensions: true;
  };

export type TDimensionsInit = {
  isDimensions: false;
};
