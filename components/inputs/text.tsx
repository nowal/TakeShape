import { forwardRef } from 'react';
import { TInputProps } from '@/types/dom/element';
import { cx } from 'class-variance-authority';

type TProps = TInputProps;
const InputsText = forwardRef<HTMLInputElement, TProps>(
  (props, ref) => {
    return (
      <div>
        <label className="block text-md font-medium text-gray-700">
          <input
            ref={ref}
            className={cx(
              'px-6 py-4 border border-gray-4 rounded-4xl w-full bg-white-1',
              'typography-signup-input'
            )}
            {...props}
          />
        </label>
      </div>
    );
  }
);

InputsText.displayName = 'InputsText';
export { InputsText };
