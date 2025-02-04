import type { FC } from 'react';
import { motion } from 'framer-motion';
import { TTextareaMotionProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import { usePreferences } from '@/context/preferences/provider';

type TProps = TTextareaMotionProps;
export const PreferencesSpecialRequest: FC<TProps> = ({
  classValue,
  ...props
}) => {
  const preferences = usePreferences();
  const { specialRequests, dispatchSpecialRequests } =
    preferences;
  return (
    <label className="flex flex-col items-center w-full">
      <motion.textarea
        name="specialRequests"
        placeholder="E.g. Don't paint ceilings in bedrooms, don't remove nails in the wall"
        rows={3}
        className={cx(
          'rounded-lg border border-gray-15 bg-white-2 w-full px-4.5 py-3.5 outline-none',
          classValue
        )}
        value={specialRequests}
        onChange={(event) =>
          dispatchSpecialRequests(event.currentTarget.value)
        }
        {...props}
      />
    </label>
  );
};
