import { CommonIcon12 } from '@/components/icon/12';
import type {FC} from 'react';

export const CommonIconClose8: FC = () => {
  return (
    <CommonIcon12
      size={8}
      d="M11 1L1 11M1 1L11 11"
      // stroke="#737373"
      pathProps={{
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }}
      fill="none"
      stroke="currentColor"
    />
  );
};
