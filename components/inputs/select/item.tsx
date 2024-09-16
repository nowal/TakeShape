import { forwardRef } from 'react';
import { IconsCheckboxChecked } from '@/components/icons/inputs/checkbox/checked';
import { TClassValueProps, TDivProps } from '@/types/dom';
import { TPropsWithChildren } from '@/types/dom/main';
import * as Select from '@radix-ui/react-select';
import { cx } from 'class-variance-authority';

type TProps = TPropsWithChildren<
  TClassValueProps & Select.SelectItemProps & TDivProps
>;
export const SelectItem = forwardRef<
  HTMLDivElement,
  TProps
>(
  (
    { children, classValue, style, ...props },
    forwardedRef
  ) => {
    return (
      <Select.Item
        className={cx('row grow', 'p-2', classValue)}
        style={{
          ...style,
        }}
        {...props}
        ref={forwardedRef}
      >
        <h4 className={cx('text-gray-7', 'p-2')}>
          <Select.ItemText className="p-2">
            {children}
          </Select.ItemText>
        </h4>
        <Select.ItemIndicator>
          <IconsCheckboxChecked />
        </Select.ItemIndicator>
      </Select.Item>
    );
  }
);
