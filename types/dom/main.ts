import { cx } from 'class-variance-authority';
import { PropsWithChildren } from 'react';

type TClassValue = Parameters<typeof cx>[0];

export type TError = never | unknown;
export type TEmptyRecord = Record<string, unknown>;
export type TAnyRecord = Record<string, never>;

export type TBaseChildren = JSX.Element | null | string;
export type TChildrenElement =
  | TBaseChildren
  | TBaseChildren[];
export type TChildren = string | TChildrenElement | null;
export type TPropsWithChildren<P = unknown> =
  PropsWithChildren<P>;

export type TChildrenProps = { children: TChildren };
export type TChildrenHandler<T> = (props: T) => TChildren;
export type TChildrenHandlerProps<T> = {
  children: TChildrenHandler<T>;
};
// export type TPropsWithChildrenHandler<P = unknown> = P & {
//   children: TChildrenHandler<P>;
// };

export type TPropsWithChildrenHandler<
  P extends object = object,
  N extends object = object
> = P & {
  children: TChildrenHandler<N>;
};

export type TChildrenPartialProps = Partial<TChildrenProps>;
export type TChildrenString = { children: string };
export type TChildrenPartialString =
  Partial<TChildrenString>;
export type TChildrenStrings = { children: string[] };

export type TClassValueProps = {
  classValue?: TClassValue;
};

export type TTitleProps<T extends string = string> = {
  title: T;
};

export type TRect = DOMRect | null;
