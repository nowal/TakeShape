import type { FC } from 'react';
import { motion } from 'framer-motion';
import { TTextareaMotionProps } from '@/types/dom';
import { cx } from 'class-variance-authority';

type TProps = TTextareaMotionProps;
export const PreferencesSpecialRequest: FC<TProps> = ({
  classValue,
  ...props
}) => {
  return (
    <label className="flex flex-col items-center w-full">
      <div className="h-14" />
      <h4 className="typography-form-subtitle">
        Special Request
      </h4>
      <div className="h-4" />
      <motion.textarea
        name="specialRequests"
        placeholder="E.g. Don't paint ceilings in bedrooms, don't remove nails in the wall"
        rows={3}
        className={cx(
          'rounded-lg border border-white-3 bg-white-2 w-full px-4.5 py-3.5 outline-none',
          classValue
        )}
        {...props}
      />
    </label>
  );
};