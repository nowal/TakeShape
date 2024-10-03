import type { FC } from 'react';
import {
  ButtonsCvaButton,
  TButtonsCvaButtonProps,
} from '@/components/cva/button';
import { IconsCloseFat } from '@/components/icons/close/fat';

export type TComponentsPanelCloseProps = Partial<TButtonsCvaButtonProps>;
export const ComponentsPanelClose: FC<TComponentsPanelCloseProps> = (
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
