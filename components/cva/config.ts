import { cva } from 'class-variance-authority';

export const buttonsCvaConfig = cva(
  ['inline-flex', 'items-center'],
  {
    variants: {
      weight: {
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
      size: {
        none: [],
        xs: ['relative', 'px-4', 'py-3', 'rounded-4xl', 'leading-none'],
        sm: ['relative', 'px-7', 'py-2.5', 'rounded-4xl', 'leading-leading'],
        md: ['relative', 'px-6', 'py-4', 'rounded-5xl', 'leading-leading'],
        iconXl: ['relative', 'size-12'],
        iconLg: ['relative', 'size-10'],
        iconMd: ['relative', 'size-8'],
        fill: ['absolute inset-0'],
      },
      center: {
        true: 'justify-center',
      },
      isDisabled: {
        true: 'cursor-not-allowed opacity-70 brightness-80 z-0',
      },
      isIconOnly: {
        true: [],
      },
      rounded: {
        none: [],
        lg: ['rounded-lg'],
        xl: ['rounded-xl'],
        '4xl': ['rounded-4xl'],
        full: ['rounded-full'],
      },
      intent: {
        primary: [
          'bg-pink',
          'hover:bg-pink-1',
          'active:bg-black',
          'text-white',
          'border',
          'border-gray-4',
          'gap-1',
          'font-bold'
        ],
        ghost: [
          'bg-white',
          'border-gray',
          'border',
          'gap-1',
        ],
        'ghost-1': [
          'bg-white-pink',
          'border-pink',
          'border',
          'gap-1',
        ],
        icon: [],
        none: ['text-inherit', 'size-auto'],
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
        isDisabled: true,
        className: ['z-0'],
      },
      {
        isDisabled: false,
        className: ['z-10'],
      },
    ],
    defaultVariants: {
      intent: 'none',
      isDisabled: false,
      isIconOnly: false,
    },
  }
);
