import {FC, HTMLAttributes} from 'react';
import {cx} from 'class-variance-authority';
import { TInputProps } from '@/types/dom/element';
import { isDefined } from '@/utils/validation/is/defined';

export type TColorPickerInputProps = Omit<
  HTMLAttributes<HTMLLabelElement>,
  'onChange' | 'color'
> & {colorValue?: string | null} & Pick<TInputProps, 'name' | 'onChange'>;
export const InputsColorPickerInput: FC<TColorPickerInputProps> = (props) => {
  const {onChange, name, colorValue, ...labelProps} = props;

  let color = colorValue;

  let displayValue = '-';
  if (isDefined(color) && color !== null) {
    displayValue = color;
  } else {
    color = '#ffffff'; // default color
  }

  return (
    <label
      className={cx(
        'flex flex-row items-center justify-between relative',
        'px-2 py-1',
        color.startsWith('#') ? 'w-[105px]' : 'gap-2',
        'rounded-editor border border-_neutral-200'
      )}
      {...labelProps}
    >
      <>
        <div
          className="size-5 rounded-md border border-_neutral-200"
          style={{backgroundColor: color}}
        />
        <div className="text-12 leading-18 text-_neutral-700 font-sans">
          {displayValue}
        </div>
      </>
      <input
        name={name}
        type="color"
        className="inset-0 absolute opacity-0"
        value={color}
        onChange={onChange}
      />
    </label>
  );
};
