import { CvaIcon } from '@/components/cva/icon';
import type {FC, PropsWithChildren} from 'react';

export const CvaIconTrailing: FC<PropsWithChildren> = ({children}) => {
  return <CvaIcon>{children}</CvaIcon>;
};
