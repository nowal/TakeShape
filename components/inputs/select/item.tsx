import { forwardRef } from 'react';
import { TClassValueProps, TDivProps } from '@/types/dom';
import { TPropsWithChildren } from '@/types/dom/main';
import * as Select from '@radix-ui/react-select';
import { cx } from 'class-variance-authority';

type TProps = TPropsWithChildren<
  TClassValueProps & Select.SelectItemProps & TDivProps
>;
const SelectItem = forwardRef<HTMLDivElement, TProps>(
  (
    { children, classValue, style, ...props },
    forwardedRef
  ) => {
    return (
      <Select.Item
        className={cx(
          'relative flex flex-row items-center grow',
          'w-full',
          'p-2',
          'px-3',
          'cursor-pointer outline-none select-none',
          'text-gray-7',
          'data-[highlighted]:text-pink data-[highlighted]:bg-white-1 data-[highlighted]:bg-opacity-50',
          'drop-shadow-05',
          'text-sm',
          classValue
        )}
        style={{
          ...style,
        }}
        {...props}
        ref={forwardedRef}
      >
        <Select.ItemText>{children}</Select.ItemText>
      </Select.Item>
    );
  }
);
SelectItem.displayName = 'SelectItem';
export { SelectItem };
