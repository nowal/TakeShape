import { FC } from 'react';
import { cx } from 'class-variance-authority';

type TTextLayout = {
  pretitle?: string;
  title?: string;
  subtitle?: string | JSX.Element;
  text?: string | JSX.Element;
};
export const TextLayout: FC<TTextLayout> = ({
  pretitle,
  text,
  subtitle,
  title,
}) => {
  return (
    <>
      <span
        className={cx(
          'leading-none',
          'py-2.5 px-4 rounded-xl',
          'text-pink font-bold',
          'bg-white sm:bg-white-pink-4'
        )}
      >
        {pretitle}
      </span>
      <div className="h-3" />
      <h2
        className={cx(
          'typography-landing-subtitle--responsive',
          'px-0 xs:px-7 md:px-0'
        )}
      >
        {title}
      </h2>
      <div className="h-4" />
      <div className="text-pink font-bold text-xl	">
        {subtitle}
      </div>
      <div className="h-1" />
      <div className="text-gray-7">{text}</div>
    </>
  );
};
