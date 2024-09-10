import { cva } from 'class-variance-authority';

export const buttonsCvaConfig = cva(
  ['relative', 'flex items-center', 'box-content', 'gap-2', 'text-base', 'leading-7'],
  {
    variants: {
      weight: {
        semibold: 'font-semibold',
        bold: 'font-bold'
      },
      size: {
        sm: ['px-7', 'py-2.5', 'rounded-4xl'],
        md: ['px-6', 'py-4', 'rounded-5xl'],
      },
      isDisabled: {
        true: 'cursor-not-allowed opacity-70 brightness-80 z-0',
      },
      isIconOnly: {
        true: 'size-9',
      },
      rounded: {
        none: [],
        left: ['rounded-l-xl box-content'],
        right: ['-ml-px', 'rounded-r-xl box-content'],
        normal: ['rounded-xl'],
      },
      intent: {
        primary: ['bg-pink', 'text-white'],
        ghost: ['bg-white', 'border-gray', 'border'],
        none: [],
      },
    },
    compoundVariants: [
      {
        intent: 'ghost',
        isDisabled: true,
        className: ['text-gray'],
      },
      {
        intent: 'ghost',
        isDisabled: false,
        className: ['text-pink'],
      },
      {
        rounded: ['left', 'right'],
        isDisabled: true,
        className: ['z-0'],
      },
      {
        rounded: ['left', 'right'],
        isDisabled: false,
        className: ['z-10'],
      },
    ],
    defaultVariants: {
      weight: 'semibold',
      intent: 'none',
      isDisabled: false,
      isIconOnly: false,
    },
  }
);
