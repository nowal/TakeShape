import type { FC } from 'react';

export const QuoteInstructionsBackground: FC = () => {
  return (
    <div className="hidden absolute w-full left-0 top-0 lg:block">
      <svg
        width="327"
        height="335"
        viewBox="0 0 327 335"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.6129 16C8.6129 7.16344 15.7763 0 24.6129 0H311C319.837 0 327 7.16344 327 16V319C327 327.837 319.837 335 311 335H24.6129C15.7764 335 8.6129 327.837 8.6129 319V188.304C8.6129 185.153 7.68288 182.073 5.93945 179.449L3.59205 175.916C0.176114 170.775 0.0221229 164.128 3.19633 158.834L6.33516 153.599C7.82563 151.113 8.6129 148.269 8.6129 145.371V16Z"
          fill="#FFF6F7"
        />
      </svg>
    </div>
  );
};
