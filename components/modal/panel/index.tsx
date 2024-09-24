import type { FC, ReactElement } from 'react';
import {
  ComponentsModalPanelClose,
  TComponentsModalPanelCloseProps,
} from '@/components/modal/panel/close';
import { isString } from '@/utils/validation/is/string';
import { cx } from 'class-variance-authority';
import { TDivProps } from '@/types/dom';

type TProps = Omit<TDivProps, 'title'> & {
  title?: string | JSX.Element;
  closeProps?: TComponentsModalPanelCloseProps;
};
export const ComponentsModalPanel: FC<TProps> = ({
  title,
  closeProps,
  children,
  classValue,
  ...props
}) => {
  const Title = () => {
    if (!title) return null;
    if (isString(title)) {
      return (
        <h4 className="typography-page-title-semibold">
          {title}
        </h4>
      );
    }
    return title;
  };
  return (
    <div
      className={cx(
        'fill-column-white-sm w-full xs:w-[345px]',
        classValue
      )}
      {...props}
    >
      <Title />
      {closeProps && (
        <ComponentsModalPanelClose
          title="Close Login Modal"
          isIconOnly
          rounded="full"
          center
          size="iconLg"
          intent="icon"
          classValue="bg-black hover:bg-gray-7 active:bg-pink text-white"
          {...closeProps}
        />
      )}

      {children}
    </div>
  );
};
