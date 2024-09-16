import { forwardRef } from 'react';
import { TInputProps } from '@/types/dom/element';
import { cx } from 'class-variance-authority';

type TProps = TInputProps & { classPadding?: string };
const InputsText = forwardRef<HTMLInputElement, TProps>(
  ({ classPadding, classValue, ...props }, ref) => {
    return (
      <label className="block text-md font-medium text-gray-700">
        <input
          ref={ref}
          className={cx(
            'border border-gray-4 rounded-4xl w-full bg-white-1',
            'typography-signup-input',
            classValue,
            classPadding ?? 'px-6 py-4'
          )}
          {...props}
        />
      </label>
    );
  }
);

InputsText.displayName = 'InputsText';
export { InputsText };
