import { FC } from 'react';
import { cx } from 'class-variance-authority';
import * as Select from '@radix-ui/react-select';
import { TValueChangeHandler } from '@/components/inputs/types';
import {
  InputsSelectListIdTitle,
  TInputsSelectListIdTitleProps,
} from '@/components/inputs/select/list/id-title';
import { TInputsSelectListBasicProps } from '@/components/inputs/select/list/basic';
import {
  resolveValues,
  TResolveValuesConfig,
} from '@/components/inputs/select/resolve-values';
import { IconsSelectChevronDown } from '@/components/icons/select/chevron/down';

export type TInputsSelectRootProps = Select.SelectProps;
export type TBaseInputsSelectProps = Pick<
  TInputsSelectRootProps,
  'defaultValue' | 'value' | 'required'
>;
export type TInputsSelectProps = TBaseInputsSelectProps &
  TResolveValuesConfig & {
    title?: string | JSX.Element;
    name: string;
    placeholder: string;
    onValueChange: TValueChangeHandler;
    ListFc?: FC<
      | TInputsSelectListIdTitleProps
      | TInputsSelectListBasicProps
    >;
  };
export const InputsSelect = ({
  name,
  basicValues,
  idValues,
  title,
  placeholder,
  onValueChange,
  ...props
}: TInputsSelectProps) => {
  const values = resolveValues({ idValues, basicValues });
  return (
    <Select.Root
      onValueChange={(value) => onValueChange(name, value)}
      {...props}
    >
      <div>
        <Select.Trigger
          className={cx(
            'column-start justify-start',
            'text-left',
            'truncate',
            'ring-0 outline-0',
            'py-2',
            'px-4',
            'border border-gray-1 rounded-4xl',
            'text-sm',
            'font-medium'
          )}
          aria-label={placeholder}
        >
          {title && <h4>{title}</h4>}
          <div className={cx('flex flex-row gap-2 w-full')}>
            <div className="truncate w-full">
              <Select.Value placeholder={placeholder} />
            </div>
            <Select.Icon className="flex items-center justify-center">
              <IconsSelectChevronDown />
            </Select.Icon>
          </div>
        </Select.Trigger>
      </div>

      <Select.Portal>
        <Select.Content
          position="popper"
          className={cx(
            'column-stretch',
            'my-2',
            'rounded-xl',
            'border border-gray-8',
            'bg-white',
            'drop-shadow-05',
            'overflow-hidden',
            'z-20'
          )}
          align="center"
          side="bottom"
        >
          <Select.Viewport>
            <InputsSelectListIdTitle values={values} />
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
