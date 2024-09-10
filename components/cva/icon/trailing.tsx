import { ButtonsCvaIcon } from '@/components/cva/icon';
import type {FC, PropsWithChildren} from 'react';

export const ButtonsCvaIconTrailing: FC<PropsWithChildren> = ({children}) => {
  return <ButtonsCvaIcon>{children}</ButtonsCvaIcon>;
};
