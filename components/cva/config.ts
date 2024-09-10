import { cva } from 'class-variance-authority';

export const buttonsCvaConfig = cva(
  ['relative', 'flex items-center', 'box-content', 'gap-2'],
  {
    variants: {
      size: {
        sm: ['px-7', 'py-2.5'],
        md: ['px-6', 'py-2'],
      },
      isDisabled: {
        true: 'cursor-not-allowed opacity-70 brightness-80 z-0',
      },
      isIconOnly: {
        true: 'size-[36px]',
      },
      rounded: {
        none: [],
        left: ['rounded-l-md box-content'],
        right: ['-ml-px', 'rounded-r-md box-content'],
        normal: ['rounded-md'],
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
      rounded: 'normal',
      intent: 'none',
      isDisabled: false,
      isIconOnly: false,
    },
  }
);
