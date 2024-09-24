import type { FC } from 'react';
import {
  ComponentsModalPanelClose,
  TComponentsModalPanelCloseProps,
} from '@/components/modal/panel/close';
import { TPropsWithChildren } from '@/types/dom/main';

type TProps = TPropsWithChildren<{
  title: string;
  closeProps: TComponentsModalPanelCloseProps;
}>;
export const ComponentsModalPanel: FC<TProps> = ({
  title,
  closeProps,
  children,
}) => {
  return (
    <div className="fill-column-white-sm w-[345px]">
      <h4 className="typography-page-title-semibold">
        {title}
      </h4>
      <div className="h-4" />
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
      {children}
    </div>
  );
};
