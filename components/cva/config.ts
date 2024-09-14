import { cva } from 'class-variance-authority';

export const buttonsCvaConfig = cva(
  ['inline-flex', 'items-center', 'leading-7'],
  {
    variants: {
      weight: {
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
      size: {
        none: [],
        sm: ['relative', 'px-7', 'py-2.5', 'rounded-4xl'],
        md: ['relative', 'px-6', 'py-4', 'rounded-5xl'],
        fill: ['absolute inset-0'],
      },
      center: {
        true: 'justify-center',
      },
      isDisabled: {
        true: 'cursor-not-allowed opacity-70 brightness-80 z-0',
      },
      isIconOnly: {
        true: 'size-9',
      },
      rounded: {
        none: [],
        lg: ['rounded-lg'],
        xl: ['rounded-xl'],
      },
      intent: {
        primary: [
          'bg-pink',
          'text-white',
          'border',
          'border-pink',
          'gap-1',
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
