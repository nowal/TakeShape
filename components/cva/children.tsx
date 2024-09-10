import type {FC} from 'react';
import { motion } from 'framer-motion';
import { TDivMotionProps } from '@/types/dom';

export type TButtonsCvaChildrenProps = Pick<TDivMotionProps, 'children'>
export const ButtonsCvaChildren: FC<TButtonsCvaChildrenProps> = ({
  children,
}) => {
  return (
    <motion.div className="truncate mt-[-1px] pointer-events-none" layout="preserve-aspect">
      {children}
    </motion.div>
  );
};
