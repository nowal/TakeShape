import {HTMLMotionProps, SVGMotionProps} from 'framer-motion';
import {PropsWithChildren} from 'react';
import {TClassValueProps, TTitleProps} from './main';

export type TDivMotionProps = HTMLMotionProps<'div'> & TClassValueProps;

export type TSectionMotionProps = HTMLMotionProps<'hr'> & TClassValueProps;

export type TDivMotionNormalChildrenProps = PropsWithChildren<TDivMotionProps>;

export type TUlMotionProps = HTMLMotionProps<'ul'> & TClassValueProps;

export type TButtonMotionProps = HTMLMotionProps<'button'> &
  TTitleProps &
  TClassValueProps;
export type TAnchorMotionProps = HTMLMotionProps<'a'> &
  TTitleProps &
  TClassValueProps;
export type TImgMotionProps = HTMLMotionProps<'img'> & TClassValueProps;
export type TInputMotionProps = HTMLMotionProps<'input'> & TClassValueProps;
export type TLabelMotionProps = HTMLMotionProps<'label'> & TClassValueProps;

export type TTextareaMotionProps = HTMLMotionProps<'textarea'> &
  TClassValueProps;

export type THrMotionProps = HTMLMotionProps<'hr'> & TClassValueProps;

export type TSvgMotionProps = SVGMotionProps<SVGSVGElement> & TClassValueProps;

export type TSpanMotionProps = HTMLMotionProps<'span'>;
export type TSampMotionProps = HTMLMotionProps<'samp'>;
export type TFigureMotionProps = HTMLMotionProps<'figure'>;
// type TSwitchChildren = Omit<typeof LinkMotion, 'children'> & Pick<HTMLDivElement, 'children'>
