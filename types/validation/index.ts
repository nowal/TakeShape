export type TFalsy = null | undefined | false | 0 | -0 | 0n | '';

export type TTruthy<T> = T extends TFalsy ? never : T;

export type TDefined<T> = T extends undefined ? never : T;

export type TObjectUrl = `blob:${string}`;
