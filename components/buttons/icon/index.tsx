import type {FC, PropsWithChildren} from 'react';
import {motion} from 'framer-motion';

export const ButtonsCvaIcon: FC<PropsWithChildren> = ({children}) => {
  return (
    <motion.div
      layout
      className="flex items-center justify-center size-6 pointer-events-none"
      // {...MOTION_DELAY_08}
    >
      {children}
    </motion.div>
  );
};
