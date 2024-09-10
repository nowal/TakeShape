import type {FC} from 'react';
import {AnimatePresence} from 'framer-motion';
import {ButtonsCvaIconLeading} from '@/components/cva/icon/leading';
import {ButtonsCvaIconTrailing} from '@/components/cva/icon/trailing';
import {TButtonsCvaContentProps} from '@/components/cva/types';
import {ButtonsCvaChildren} from '@/components/cva/children';

export const ButtonsCvaContent: FC<TButtonsCvaContentProps> = ({
  Icon,
  children,
}) => {
  return (
    <>
      <AnimatePresence>
        {Icon.isLeading && (
          <ButtonsCvaIconLeading key="icon-leading">
            <Icon.Leading />
          </ButtonsCvaIconLeading>
        )}
      </AnimatePresence>
      <ButtonsCvaChildren>{children}</ButtonsCvaChildren>
      <AnimatePresence>
        {Icon.isTrailing && (
          <ButtonsCvaIconTrailing key="icon-trailing">
            <Icon.Trailing />
          </ButtonsCvaIconTrailing>
        )}
      </AnimatePresence>
    </>
  );
};
