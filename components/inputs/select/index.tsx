import { FC, Fragment } from 'react';
import { IconsChevronsDown } from '@/components/icons/chevrons/down';
import { TSelectValues } from '@/components/inputs/select/types';
import { LinesHorizontalLight } from '@/components/lines/horizontal/light';
import { cx } from 'class-variance-authority';
import clsx from 'clsx';
import * as Select from '@radix-ui/react-select';
import { SelectItem } from '@/components/inputs/select/item';
import { TValueChangeHandler } from '@/components/inputs/types';

export type TInputsSelectProps = Select.SelectProps;
export type TBaseInputsSelectProps = Pick<
  TInputsSelectProps,
  'defaultValue'|'value'
>;
type TProps = TBaseInputsSelectProps & {
  title?: string | JSX.Element;
  name: string;
  placeholder: string;
  values: TSelectValues;
  onValueChange: TValueChangeHandler;
};
export const InputsSelect: FC<TProps> = ({
  name,
  values,
  title,
  placeholder,
  onValueChange,
  ...props
}) => {
  return (
    <Select.Root
      onValueChange={(value) => onValueChange(name, value)}
      {...props}
    >
      <div>
        <Select.Trigger
          className={clsx(
            'column-start justify-start',
            'text-left',
            'truncate',
            'ring-0 outline-0',
            'py-3',
            'px-4',
            'border border-gray-1 rounded-4xl'
          )}
          aria-label={placeholder}
        >
          {title && <h4>{title}</h4>}
          <div className={cx('flex flex-row gap-2 w-full')}>
            <div className="truncate w-full">
              <Select.Value placeholder={placeholder} />
            </div>

            <Select.Icon className="flex items-center justify-center">
              <IconsChevronsDown />
            </Select.Icon>
          </div>
        </Select.Trigger>
      </div>

      <Select.Portal>
        <Select.Content
          position="popper"
          className={clsx(
            'column-stretch z-20',
            'rounded-xl',
            'my-2',
            'border border-gray-8',
            // 'py-0.5',
            'bg-white',
            'drop-shadow-05',
            'overflow-hidden'
          )}
          align="center"
          side="top"
        >
          <Select.Viewport>
            {values.map((value, index) => {
              return (
                <Fragment key={value}>
                  {index !== 0 && <LinesHorizontalLight />}
                  <SelectItem
                    className={cx(
                      'relative row-space cursor-pointer outline-none select-none',
                      'data-[highlighted]:bg-white-1 data-[highlighted]:bg-opacity-50',
                      'drop-shadow-05'
                    )}
                    value={value}
                  >
                    {value}
                  </SelectItem>
                </Fragment>
              );
            })}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
