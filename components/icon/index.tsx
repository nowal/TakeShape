import clsx from 'clsx';
import { SVGAttributes, FC } from 'react';
import { isDefined } from '@/utils/validation/is/defined';
import { TSvgProps, TClassValueProps } from '@/types/dom';
import { resolveSquare } from '@/utils/measure/resolve-square';

export type TCommonIconProps = Omit<
  TSvgProps,
  'fill' | 'd'
> &
  TClassValueProps & {
    defs?: JSX.Element;
    svgProps?: TSvgProps;
    pathProps?: SVGAttributes<SVGPathElement>;
    size?: number | string;
    fill?: string;
    d?: string;
  };
export type TCommonIconFC<P extends object = object> = FC<
  TCommonIconProps & P
>;

export const CommonIcon: TCommonIconFC = ({
  svgProps,
  pathProps,
  className,
  classValue,
  size,
  stroke,
  fill,
  d,
  viewBox,
  defs,
  children,
  ...props
}) => {
  const isPath = isDefined(d || pathProps);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('shrink-0', className, classValue)}
      {...resolveSquare(size ? Number(size) : 24)}
      viewBox={viewBox ?? '0 0 24 24'}
      {...(isPath ? {} : { fill, stroke })}
      {...svgProps}
      {...props}
    >
      {isDefined(defs) && <defs>{defs}</defs>}
      {isPath && (
        <path
          d={d}
          stroke={stroke ?? 'none'}
          fill={fill ?? 'currentColor'}
          {...pathProps}
        />
      )}
      {children}
    </svg>
  );
};
