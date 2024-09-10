import { ButtonsCvaIcon } from '@/components/buttons/icon';
import type {FC, PropsWithChildren} from 'react';

export const ButtonsCvaIconLeading: FC<PropsWithChildren> = ({children}) => {
  return <ButtonsCvaIcon>{children}</ButtonsCvaIcon>;
};
