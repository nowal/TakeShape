import type { FC } from 'react';
import {
  ButtonsCvaButton,
  TButtonsCvaButtonProps,
} from '@/components/cva/button';
import { IconsCloseFat } from '@/components/icons/close/fat';

export type TComponentsModalPanelCloseProps = Partial<TButtonsCvaButtonProps>;
export const ComponentsModalPanelClose: FC<TComponentsModalPanelCloseProps> = (
  props
) => {
  return (
    <div className="absolute bottom-full -translate-y-3 right-0">
      <ButtonsCvaButton
        title="Close Modal"
        isIconOnly
        rounded="full"
        center
        size="iconLg"
        intent="icon"
        classValue="bg-black hover:bg-gray-7 active:bg-pink text-white"
        {...props}
      >
        <IconsCloseFat />
      </ButtonsCvaButton>
    </div>
  );
};
