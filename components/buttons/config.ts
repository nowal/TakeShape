import {cva} from 'class-variance-authority';

export const buttonsCvaConfig = cva(
  ['relative', 'flex items-center', 'box-content', 'gap-2'],
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed opacity-70 brightness-80 z-0',
      },
      isIconOnly: {
        true: 'size-[36px]',
      },
      rounded: {
        none: [],
        left: ['rounded-l-editor box-content'],
        right: ['-ml-px', 'rounded-r-editor box-content'],
        normal: ['rounded-editor'],
      },
      hierarchy: {
        primary: [
          'bg-black',
          'text-white',
          'h-[36px]',
          'px-[14px]',
          'text14BoldTracking20',
        ],
        secondary: [
          'bg-white',
          'border-_neutral-300',
          'h-[36px]',
          'px-[14px]',
          'text14BoldTracking20',
          'border',
        ],
        ghost: [
          'bg-_neutral-100',
          'text-black',
          'text14BoldTracking20',
          'h-[28px]',
          'px-[8px]',
        ],
        text: ['h-[28px]', 'px-[8px]'],
        none: [],
      },
    },
    compoundVariants: [
      {
        hierarchy: 'secondary',
        isDisabled: true,
        className: ['text-_neutral-400'],
      },
      {
        hierarchy: 'secondary',
        isDisabled: false,
        className: ['text-black'],
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
      hierarchy: 'none',
      isDisabled: false,
      isIconOnly: false,
    },
  }
);
