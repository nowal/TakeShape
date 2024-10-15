import { SVGAttributes, FC } from 'react';
import { isDefined } from '@/utils/validation/is/defined';
import { TClassValueProps } from '@/types/dom';
import { resolveSquare } from '@/utils/measure/resolve-square';
import { cx } from 'class-variance-authority';
import { TSvgIconProps } from '@/types/dom/element';

export type TCommonIconProps = Omit<
  TSvgIconProps,
  'fill' | 'd'
> &
  TClassValueProps & {
    defs?: JSX.Element;
    svgProps?: TCommonIconProps;
    pathProps?: SVGAttributes<SVGPathElement>;
    size?: number | string;
    fill?: string;
    d?: string;
    classColor?: string;
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
  classColor,
  children,
  ...props
}) => {
  const isPath = isDefined(d || pathProps);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cx(
        'shrink-0',
        classColor ?? 'stroke-pink',
        className,
        classValue
      )}
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
