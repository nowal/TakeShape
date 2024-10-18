export type TStrRecord = Record<string, any>;
export type TResolveObjectKey<T> = keyof T extends infer U
  ? U extends string
    ? U
    : U extends number
    ? `${U}`
    : never
  : never;
export type TResolveObjectValue<T> = T[keyof T];
export type TResolveObjectEntries = <T>(
  obj: T
) => [TResolveObjectKey<T>, TResolveObjectValue<T>][];

export type TResolveObjectKeys = <T>(
  obj: T
) => TResolveObjectKey<T>[];

export type TResolveObjectValues = <T>(
  obj: T
) => TResolveObjectValue<T>[];
